import { CallbackQueryContext, Context } from 'grammy'
import { advInfo } from '../../../function/advancedConsole'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../function/grammyFunctions'
import { getMaintenanceText } from '../../textFabric/maintenance'
import { lang } from '../../../translation/base'

export async function runMaintenanceinformCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const ctxFromId = ctx.from?.id
  if (ctxFromId !== undefined) {
    advInfo(`User ${ctxFromId} tried to use a command but the bot is in maintenance mode!`)
  }
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'maintenanceInformMessage'))
  await ctxReply(ctx, getMaintenanceText())
}
