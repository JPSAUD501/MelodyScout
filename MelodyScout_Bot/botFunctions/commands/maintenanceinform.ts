import { CommandContext, Context } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'
import { advInfo } from '../../../function/advancedConsole'
import { getMaintenanceText } from '../../textFabric/maintenance'

export async function runMaintenanceinformCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxFromId = ctx.from?.id
  if (ctxFromId !== undefined) {
    advInfo(`User ${ctxFromId} tried to use a command but the bot is in maintenance mode!`)
  }
  await ctxReply(ctx, getMaintenanceText())
}
