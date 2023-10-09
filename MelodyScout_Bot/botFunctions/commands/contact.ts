import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
// import { lang } from '../../../translations/base'
import { getContactText } from '../../textFabric/contact'

export async function runContactCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  await ctxReply(ctx, undefined, getContactText(ctxLang))
}
