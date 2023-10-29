import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { advLog } from '../../../functions/advancedConsole'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getMaintenanceText } from '../../textFabric/maintenance'

export async function runMaintenanceCommand (ctx: CommandContext<Context>): Promise<{
  success: true
  maintenanceMode: boolean
} | {
  success: false
}> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return { success: false }
  }
  const ctxFromId = ctx.from?.id
  if (ctxFromId === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }))
    return { success: false }
  }
  if (!melodyScoutConfig.admins.includes(ctxFromId.toString())) return { success: false }
  const args = ctx.message?.text?.split(' ')
  if (args === undefined) return { success: false }
  if (args.length < 2) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'noMaintenanceModeArgumentErrorMessage', value: 'Por favor, especifique se deseja ativar ou desativar o modo manutenção! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>' }))
    return { success: false }
  }
  switch (args[1]) {
    case 'on': {
      await ctxReply(ctx, undefined, getMaintenanceText(ctxLang, true))
      advLog('Maintenance mode activated!')
      return { success: true, maintenanceMode: true }
    }
    case 'off': {
      await ctxReply(ctx, undefined, getMaintenanceText(ctxLang, false))
      advLog('Maintenance mode deactivated!')
      return { success: true, maintenanceMode: false }
    }
    default: {
      await ctxReply(ctx, undefined, lang(ctxLang, { key: 'invalidMaintenanceModeArgumentErrorMessage', value: 'Utilize apenas <code>on</code> ou <code>off</code> como argumento! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>' }))
      return { success: false }
    }
  }
}
