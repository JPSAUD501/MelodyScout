import { type CallbackQueryContext, type CommandContext, type Context, type InlineQueryContext } from 'grammy'
import { advLog } from '../function/advancedConsole'

export function logNewCommand (ctx: CommandContext<Context>): void {
  if (!((ctx.message?.text?.startsWith('/')) ?? false)) return
  const chatTittle = (ctx.chat.type === 'private') ? 'Private' : ctx.chat.title ?? 'Unknown'
  advLog(`MelodyScout_Bot - New command:\nFrom: (${ctx.message?.from?.id ?? 'No ID'}) ${ctx.message?.from?.first_name ?? 'No name'} ${ctx.message?.from?.last_name ?? ''} - ${ctx.message?.from.username ?? 'No username'}\nIn: (${ctx.chat?.id}) ${chatTittle} - ${ctx.chat.type}\nCommand: ${ctx.message?.text ?? ''}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
}

export function logNewCallbackQuery (ctx: CallbackQueryContext<Context>): void {
  const chatTittle = (ctx.chat?.type === 'private') ? 'Private' : ctx.chat?.title ?? 'Unknown'
  advLog(`MelodyScout_Bot - New callback_query:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nIn: (${ctx.chat?.id ?? 'No ID'}) ${chatTittle} - ${ctx.chat?.type ?? 'No type'}\nData: ${ctx.callbackQuery?.data ?? 'No data'}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
}

export function logNewInlineQuery (ctx: InlineQueryContext<Context>): void {
  advLog(`MelodyScout_Bot - New callback_query:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nData: ${ctx.inlineQuery.query ?? 'No data'}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
}
