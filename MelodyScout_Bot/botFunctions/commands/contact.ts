import { CommandContext, Context } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'
import { lang } from '../../../translations/base'

export async function runContactCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  await ctxReply(ctx, lang(ctxLang, 'contactMessage'))
}
