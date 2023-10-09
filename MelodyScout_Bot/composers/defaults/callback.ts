import { Composer } from 'grammy'
import { advLog } from '../../../functions/advancedConsole'

export const callbackDefault = new Composer()

callbackDefault.on('callback_query', async (ctx) => {
  const chatTittle = (ctx.chat?.type === 'private') ? 'Private' : ctx.chat?.title ?? 'Unknown'
  advLog(`MelodyScout_Bot - New callback_query not handled:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nIn: (${ctx.chat?.id ?? 'No ID'}) ${chatTittle} - ${ctx.chat?.type ?? 'No type'}\nData: ${ctx.callbackQuery?.data ?? 'No data'}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
})

callbackDefault.errorBoundary((err) => {
  advLog(`Error occurred in callbackDefault: ${String(err)}`)
})
