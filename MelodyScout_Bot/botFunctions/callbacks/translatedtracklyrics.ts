import { CallbackQueryContext, Context } from 'grammy'
import { ctxAnswerCallbackQuery, ctxEditMessage, ctxReply } from '../../../function/grammyFunctions'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { geniusConfig, melodyScoutConfig } from '../../../config'
import { translate } from '@vitalets/google-translate-api'
import { getLyricsText } from '../../textFabric/lyrics'
import { lang } from '../../../translations/base'

export async function runTranslatedtracklyricsCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'dontWorkOnChannelsInformCallback'))
    return
  }
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageId = ctx.callbackQuery.message?.message_id
  if (messageId === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetMessageIdFromButtonInformMessage'))
    return
  }
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'))
    return
  }
  const msGeniusApi = new MsGeniusApi(geniusConfig.accessToken)
  const geniusSong = await msGeniusApi.getSong(track, artist)
  if (!geniusSong.success) {
    void ctxReply(ctx, lang(ctxLang, 'geniusSongLyricsNotFoundedError'))
    return
  }
  console.log('Translating lyrics...')
  const translatedTrackLyrics = await translate(geniusSong.data.lyrics, { to: 'pt-BR' })
  console.log('Lyrics translated!')
  if (translatedTrackLyrics.text.length <= 0) {
    void ctxReply(ctx, lang(ctxLang, 'unableToTranslateLyricsErrorMessage'))
    return
  }
  await ctxEditMessage(ctx, getLyricsText(track, artist, geniusSong.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, translatedTrackLyrics.text), { disable_web_page_preview: true })
}
