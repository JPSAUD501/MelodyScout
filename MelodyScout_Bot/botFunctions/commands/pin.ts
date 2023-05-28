import { CommandContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { melodyScoutConfig } from '../../../config'

export class PinCommand {
  private readonly ctxFunctions: CtxFunctions

  constructor (ctxFunctions: CtxFunctions) {
    this.ctxFunctions = ctxFunctions
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      await this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.text('Playing Now', 'PLAYINGNOW')
    const messageToPin = await this.ctxFunctions.reply(ctx, `<a href="${melodyScoutConfig.logoImgUrl}">️️</a>O que vc está ouvindo agr?`, { reply_markup: inlineKeyboard })
    if (messageToPin === undefined) {
      void this.ctxFunctions.reply(ctx, 'Parece que algo deu errado ao enviar a mensagem, por favor tente novamente!')
      return
    }
    await this.ctxFunctions.pinMessage(ctx, messageToPin)
  }
}
