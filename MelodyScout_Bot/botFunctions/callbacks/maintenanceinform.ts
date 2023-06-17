import { CallbackQueryContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { advInfo } from '../../../function/advancedConsole'

export class MaintenanceinformCallback {
  private readonly ctxFunctions: CtxFunctions

  constructor (ctxFunctions: CtxFunctions) {
    this.ctxFunctions = ctxFunctions
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    const ctxFromId = ctx.from?.id
    if (ctxFromId !== undefined) {
      advInfo(`User ${ctxFromId} tried to use a command but the bot is in maintenance mode!`)
    }
    void this.ctxFunctions.answerCallbackQuery(ctx, '🛠 - O bot está em manutenção!')
    await this.ctxFunctions.reply(ctx, `Oi <a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>, não sei como me desculpar por isso, mas Infelizmente eu estou em manutenção! Sei que isso é muito chato, mas estou tentando resolver esse problema o mais rápido possível! Em breve estarei de volta! Aproveitando a oportunidade em nome do meu desenvolvedor eu gostaria de agradecer a todos os meus usuários! 💜`)
    await this.ctxFunctions.reply(ctx, 'Se você tiver alguma sugestão ou crítica, por favor entre em contato através do comando /contact! Eu ficarei muito feliz em ouvir o que você tem a dizer!')
  }
}
