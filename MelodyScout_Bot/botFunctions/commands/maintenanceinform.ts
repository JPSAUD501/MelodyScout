import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { advInfo } from '../../../functions/advancedConsole'
import { getMaintenanceinformText } from '../../textFabric/maintenanceinform'

export async function runMaintenanceinformCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const ctxFromId = ctx.from?.id
  if (ctxFromId !== undefined) {
    advInfo(`User ${ctxFromId} tried to use a command but the bot is in maintenance mode!`)
  }
  await ctxReply(ctx, undefined, getMaintenanceinformText(ctxLang))
}
