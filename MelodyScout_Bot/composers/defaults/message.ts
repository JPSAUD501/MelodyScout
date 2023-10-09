import { Composer } from 'grammy'
import { advLog } from '../../../functions/advancedConsole'

export const messageDefault = new Composer()

messageDefault.on('message', async (ctx) => {
  if (!((ctx.message?.text?.startsWith('/')) ?? false)) return
  const chatTittle = (ctx.chat.type === 'private') ? 'Private' : ctx.chat.title ?? 'Unknown'
  advLog(`MelodyScout_Bot - New command not handled:\nFrom: (${ctx.message?.from?.id ?? 'No ID'}) ${ctx.message?.from?.first_name ?? 'No name'} ${ctx.message?.from?.last_name ?? ''} - ${ctx.message?.from.username ?? 'No username'}\nIn: (${ctx.chat?.id}) ${chatTittle} - ${ctx.chat.type}\nCommand: ${ctx.message?.text ?? ''}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
})

messageDefault.errorBoundary((err) => {
  advLog(`Error occurred in messageDefault: ${String(err)}`)
})
