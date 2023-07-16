import { CommandContext, Context } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'
import { advLog } from '../../../function/advancedConsole'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'

export async function runMaintenanceCommand (ctx: CommandContext<Context>): Promise<{
  success: true
  maintenanceMode: boolean
} | {
  success: false
}> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return { success: false }
  }
  const ctxFromId = ctx.from?.id
  if (ctxFromId === undefined) {
    await ctxReply(ctx, lang(ctxLang, 'unableToGetUserIdErrorMessage'))
    return { success: false }
  }
  if (!melodyScoutConfig.admins.includes(ctxFromId.toString())) return { success: false }
  const args = ctx.message?.text?.split(' ')
  if (args === undefined) return { success: false }
  if (args.length < 2) {
    await ctxReply(ctx, lang(ctxLang, 'noMaintenanceModeArgumentErrorMessage'))
    return { success: false }
  }
  switch (args[1]) {
    case 'on': {
      await ctxReply(ctx, lang(ctxLang, 'maintenanceModeActivatedInformMessage'))
      advLog('Maintenance mode activated!')
      return { success: true, maintenanceMode: true }
    }
    case 'off': {
      await ctxReply(ctx, lang(ctxLang, 'maintenanceModeDeactivatedInformMessage'))
      advLog('Maintenance mode deactivated!')
      return { success: true, maintenanceMode: false }
    }
    default: {
      await ctxReply(ctx, lang(ctxLang, 'invalidMaintenanceModeArgumentErrorMessage'))
      return { success: false }
    }
  }
}
