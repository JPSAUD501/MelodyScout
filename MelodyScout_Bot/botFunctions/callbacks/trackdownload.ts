import { type CallbackQueryContext, type Context, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../functions/grammyFunctions'
import { getCallbackKey } from '../../../functions/callbackMaker'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getTrackdownloadText } from '../../textFabric/trackdownload'
// import axios from 'axios'

export async function runTrackDownloadCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'loadingInformCallback', value: '⏳ - Carregando…' }))
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text(lang(ctxLang, { key: 'trackDownloadAudioButton', value: '[📥] - Áudio' }), getCallbackKey(['TAD', track.replace(/  +/g, ' '), artist.replace(/  +/g, ' ')]))
  inlineKeyboard.text(lang(ctxLang, { key: 'trackDownloadVideoButton', value: '[📥] - Vídeo' }), getCallbackKey(['TVD', track.replace(/  +/g, ' '), artist.replace(/  +/g, ' ')]))
  await ctxReply(ctx, undefined, getTrackdownloadText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name), {
    reply_markup: inlineKeyboard,
    reply_to_message_id: messageId,
    allow_sending_without_reply: true,
    disable_notification: true
  })
}
