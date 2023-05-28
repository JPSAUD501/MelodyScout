import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { AdvConsole } from '../../../function/advancedConsole'
import { melodyScoutConfig } from '../../../config'

export class MaintenanceCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions) {
    this.advConsole = advConsole
    this.ctxFunctions = ctxFunctions
  }

  async run (ctx: CommandContext<Context>): Promise<{
    success: true
    maintenanceMode: boolean
  } | {
    success: false
  }> {
    if (ctx.chat?.type === 'channel') {
      await this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return { success: false }
    }
    const ctxFromId = ctx.from?.id
    if (ctxFromId === undefined) {
      await this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!')
      return { success: false }
    }
    if (!melodyScoutConfig.admins.includes(ctxFromId.toString())) return { success: false }
    const args = ctx.message?.text?.split(' ')
    if (args === undefined) return { success: false }
    if (args.length < 2) {
      await this.ctxFunctions.reply(ctx, 'Por favor, especifique se deseja ativar ou desativar o modo manutenção! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>')
      return { success: false }
    }
    switch (args[1]) {
      case 'on': {
        await this.ctxFunctions.reply(ctx, 'Modo de manutenção ativado!')
        this.advConsole.log('Maintenance mode activated!')
        return { success: true, maintenanceMode: true }
      }
      case 'off': {
        await this.ctxFunctions.reply(ctx, 'Modo de manutenção desativado!')
        this.advConsole.log('Maintenance mode deactivated!')
        return { success: true, maintenanceMode: false }
      }
      default: {
        await this.ctxFunctions.reply(ctx, 'Utilize apenas <code>on</code> ou <code>off</code> como argumento! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>')
        return { success: false }
      }
    }
  }
}
