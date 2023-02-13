import { CallbackQueryContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { AdvConsole } from '../../../function/advancedConsole'

export class MaintenanceinformCallback {
  private readonly ctxFunctions: CtxFunctions
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions) {
    this.advConsole = advConsole
    this.ctxFunctions = ctxFunctions
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    const ctxFromId = ctx.from?.id
    if (ctxFromId !== undefined) {
      this.advConsole.info(`User ${ctxFromId} tried to use a command but the bot is in maintenance mode!`)
    }
    void this.ctxFunctions.answerCallbackQuery(ctx, '🛠 - O bot está em manutenção!')
  }
}
