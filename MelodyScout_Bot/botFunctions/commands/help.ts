import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { getHelpText } from '../../textFabric/help'
import { lang } from '../../../translations/base'

export async function runHelpCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  await ctxReply(ctx, undefined, getHelpText(ctxLang))
}
