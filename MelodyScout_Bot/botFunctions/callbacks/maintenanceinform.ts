import { CallbackQueryContext, Context } from 'grammy'
import { advInfo } from '../../../function/advancedConsole'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../function/grammyFunctions'
import { getMaintenanceText } from '../../textFabric/maintenance'

export async function runMaintenanceinformCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxFromId = ctx.from?.id
  if (ctxFromId !== undefined) {
    advInfo(`User ${ctxFromId} tried to use a command but the bot is in maintenance mode!`)
  }
  void ctxAnswerCallbackQuery(ctx, '🛠 - O bot está em manutenção!')
  await ctxReply(ctx, getMaintenanceText())
}
