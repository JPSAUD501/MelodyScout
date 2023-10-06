import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runAllusersCommand } from '../../botFunctions/commands/allusers'
import { msPrismaDbApi } from '../../bot'

export const allusersCommand = new Composer()

allusersCommand.command(['allusers'], async (ctx) => {
  logNewCommand(ctx)
  void runAllusersCommand(msPrismaDbApi, ctx)
})
