import { CommandContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'

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
    if (ctx.chat?.type === 'private') {
      await this.ctxFunctions.reply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.text('Playing Now', 'PLAYINGNOW')
    const messageToPin = await this.ctxFunctions.reply(ctx, '<a href="https://github.com/JPSAUD501/MelodyScout/blob/master/public/logo.jpg?raw=true">️️</a>O que vc está ouvindo agr?', { reply_markup: inlineKeyboard })
    if (messageToPin === undefined) {
      void this.ctxFunctions.reply(ctx, 'Parece que algo deu errado ao enviar a mensagem, por favor tente novamente!')
      return
    }
    await this.ctxFunctions.pinMessage(ctx, messageToPin)
  }
}
