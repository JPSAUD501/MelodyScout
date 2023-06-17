import { CommandContext, Context } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'
import { advLog } from '../../../function/advancedConsole'
import { melodyScoutConfig } from '../../../config'

export class MaintenanceCommand {
  async run (ctx: CommandContext<Context>): Promise<{
    success: true
    maintenanceMode: boolean
  } | {
    success: false
  }> {
    if (ctx.chat?.type === 'channel') {
      await ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return { success: false }
    }
    const ctxFromId = ctx.from?.id
    if (ctxFromId === undefined) {
      await ctxReply(ctx, 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!')
      return { success: false }
    }
    if (!melodyScoutConfig.admins.includes(ctxFromId.toString())) return { success: false }
    const args = ctx.message?.text?.split(' ')
    if (args === undefined) return { success: false }
    if (args.length < 2) {
      await ctxReply(ctx, 'Por favor, especifique se deseja ativar ou desativar o modo manutenção! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>')
      return { success: false }
    }
    switch (args[1]) {
      case 'on': {
        await ctxReply(ctx, 'Modo de manutenção ativado!')
        advLog('Maintenance mode activated!')
        return { success: true, maintenanceMode: true }
      }
      case 'off': {
        await ctxReply(ctx, 'Modo de manutenção desativado!')
        advLog('Maintenance mode deactivated!')
        return { success: true, maintenanceMode: false }
      }
      default: {
        await ctxReply(ctx, 'Utilize apenas <code>on</code> ou <code>off</code> como argumento! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>')
        return { success: false }
      }
    }
  }
}
