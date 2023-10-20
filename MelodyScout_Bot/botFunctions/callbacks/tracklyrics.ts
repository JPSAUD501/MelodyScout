import { type CallbackQueryContext, type Context, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../functions/grammyFunctions'
import { MsLyricsApi } from '../../../api/msLyricsApi/base'
import { getCallbackKey } from '../../../functions/callbackMaker'
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
  const msLyricsApi = new MsLyricsApi(geniusConfig.accessToken)
  const songLyricsData = await msLyricsApi.getLyrics(track, artist)
  if (!songLyricsData.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'trackLyricsNotFoundedError'), { reply_to_message_id: messageId, allow_sending_without_reply: true })
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text(lang(ctxLang, 'trackLyricsTranslateButton'), getCallbackKey(['TTL', track, artist]))
  await ctxReply(ctx, undefined, getLyricsText(ctxLang, track, artist, songLyricsData.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`), { reply_to_message_id: messageId, allow_sending_without_reply: true, reply_markup: inlineKeyboard, disable_web_page_preview: true })
}
