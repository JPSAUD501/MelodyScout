import { type CallbackQueryContext, type Context, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../function/grammyFunctions'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { getCallbackKey } from '../../../function/callbackMaker'
import { getLyricsText } from '../../textFabric/lyrics'
import { geniusConfig, melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'

export async function runTracklyricsCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmTrackDataNotFoundedError'))
    return
  }
  const msGeniusApi = new MsGeniusApi(geniusConfig.accessToken)
  const geniusSong = await msGeniusApi.getSong(track, artist)
  if (!geniusSong.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'geniusTrackLyricsNotFoundedError'), { reply_to_message_id: messageId, allow_sending_without_reply: true })
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text(lang(ctxLang, 'trackLyricsTranslateButton'), getCallbackKey(['TTL', track, artist]))
  await ctxReply(ctx, undefined, getLyricsText(ctxLang, track, artist, geniusSong.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`), { reply_to_message_id: messageId, allow_sending_without_reply: true, reply_markup: inlineKeyboard, disable_web_page_preview: true })
}
