import { type CallbackQueryContext, type Context } from 'grammy'
import { ctxAnswerCallbackQuery, ctxEditMessage, ctxReply } from '../../../functions/grammyFunctions'
import { MsLyricsApi } from '../../../api/msLyricsApi/base'
import { geniusConfig, melodyScoutConfig } from '../../../config'
import { translate } from '@vitalets/google-translate-api'
import { getLyricsText } from '../../textFabric/lyrics'
import { lang } from '../../../translations/base'

export async function runTranslatedtracklyricsCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageId = ctx.callbackQuery.message?.message_id
  if (messageId === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'unableToGetMessageIdFromButtonInformMessage'))
    return
  }
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'))
    return
  }
  const msLyricsApi = new MsLyricsApi(geniusConfig.accessToken)
  const songLyricsData = await msLyricsApi.getLyrics(track, artist)
  if (!songLyricsData.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'trackLyricsNotFoundedError'))
    return
  }
  console.log('Translating lyrics...')
  const translatedTrackLyrics = await translate(songLyricsData.data.lyrics, { to: 'pt-BR' })
  console.log('Lyrics translated!')
  if (translatedTrackLyrics.text.length <= 0) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'unableToTranslateLyricsErrorMessage'))
    return
  }
  await ctxEditMessage(ctx, undefined, getLyricsText(ctxLang, track, artist, songLyricsData.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, translatedTrackLyrics.text), { disable_web_page_preview: true })
}
