import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { getStartText } from '../../textFabric/start'

export async function runStartCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  await ctxReply(ctx, undefined, getStartText(ctxLang))
}
