import { CallbackQueryContext, Context, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxTempReply } from '../../../function/grammyFunctions'
import { getCallbackKey } from '../../../function/callbackMaker'
import { melodyScoutConfig } from '../../../config'
// import axios from 'axios'

export async function runTrackDownloadCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    void ctxAnswerCallbackQuery(ctx, '⚠ - Eu não funciono em canais!')
    return
  }
  void ctxAnswerCallbackQuery(ctx, '⏳ - Carregando...')
  const messageId = ctx.callbackQuery.message?.message_id
  if (messageId === undefined) {
    void ctxReply(ctx, 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
    return
  }
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text('[📥] - Audio', getCallbackKey(['TAD', track.replace(/  +/g, ' '), artist.replace(/  +/g, ' ')]))
  inlineKeyboard.text('[📥] - Video', getCallbackKey(['TVD', track.replace(/  +/g, ' '), artist.replace(/  +/g, ' ')]))
  await ctxTempReply(ctx, `<b>[📥] Download de "${track}" por "${artist}"</b>\n- Por favor escolha uma opção abaixo.\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`, 15000, {
    reply_markup: inlineKeyboard,
    reply_to_message_id: messageId,
    disable_notification: true
  })
}
