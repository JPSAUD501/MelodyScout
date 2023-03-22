import { CallbackQueryContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import config from '../../../config'
import { AdvConsole } from '../../../function/advancedConsole'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { getCallbackKey } from '../../../function/callbackMaker'
// import axios from 'axios'

export class TrackDownloadCallback {
  advConsole: AdvConsole
  ctxFunctions: CtxFunctions
  msMusicApi: MsMusicApi

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msMusicApi: MsMusicApi) {
    this.advConsole = advConsole
    this.ctxFunctions = ctxFunctions
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Eu não funciono em canais!')
      return
    }
    void this.ctxFunctions.answerCallbackQuery(ctx, '⏳ - Carregando...')
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const dataArray = ctx.callbackQuery.data.split(config.melodyScout.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.text('[📥] - Audio', getCallbackKey(['TAD', track.replace(/  +/g, ' '), artist.replace(/  +/g, ' ')]))
    inlineKeyboard.text('[📥] - Video', getCallbackKey(['TVD', track.replace(/  +/g, ' '), artist.replace(/  +/g, ' ')]))
    await this.ctxFunctions.tempReply(ctx, `<b>[📥] Download de "${track}" por "${artist}"</b>\n- Por favor escolha uma opção abaixo.\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`, 15000, {
      reply_markup: inlineKeyboard,
      reply_to_message_id: messageId,
      disable_notification: true
    })
  }
}
