import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runHelpCommand } from '../../botFunctions/commands/help'

export const helpCommand = new Composer()

helpCommand.command(['help'], async (ctx) => {
  logNewCommand(ctx)
  void runHelpCommand(ctx)
})
