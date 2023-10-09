import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runAllusersCommand } from '../../botFunctions/commands/allusers'
import { msPrismaDbApi } from '../../bot'
import { advError } from '../../../functions/advancedConsole'

export const allusersCommand = new Composer()

allusersCommand.command(['allusers'], async (ctx) => {
  logNewCommand(ctx)
  void runAllusersCommand(msPrismaDbApi, ctx)
})
allusersCommand.errorBoundary((err) => {
  advError(`Error occurred in allusersCommand: ${String(err)}`)
})
