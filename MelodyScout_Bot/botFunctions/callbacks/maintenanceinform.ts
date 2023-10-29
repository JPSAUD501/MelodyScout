import { type CallbackQueryContext, type Context } from 'grammy'
import { advInfo } from '../../../functions/advancedConsole'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../functions/grammyFunctions'
import { getMaintenanceinformText } from '../../textFabric/maintenanceinform'
import { lang } from '../../../translations/base'

export async function runMaintenanceinformCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  const ctxFromId = ctx.from.id
  if (ctxFromId !== undefined) {
    advInfo(`User ${ctxFromId} tried to use a command but the bot is in maintenance mode!`)
  }
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'maintenanceInformCallback', value: '🛠 - O bot está em manutenção!' }))
  await ctxReply(ctx, undefined, getMaintenanceinformText(ctxLang))
}
