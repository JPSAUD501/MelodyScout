import { CommandContext, Context, InlineKeyboard } from 'grammy'
import { ctxPinMessage, ctxReply } from '../../../function/grammyFunctions'
import { melodyScoutConfig } from '../../../config'

export class PinCommand {
  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      await ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.text('Playing Now', 'PLAYINGNOW')
    const messageToPin = await ctxReply(ctx, `<a href="${melodyScoutConfig.logoImgUrl}">️️</a>O que vc está ouvindo agr?`, { reply_markup: inlineKeyboard })
    if (messageToPin === undefined) {
      void ctxReply(ctx, 'Parece que algo deu errado ao enviar a mensagem, por favor tente novamente!')
      return
    }
    await ctxPinMessage(ctx, messageToPin)
  }
}
