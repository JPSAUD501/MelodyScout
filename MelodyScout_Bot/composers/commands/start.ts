import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runStartCommand } from '../../botFunctions/commands/start'

export const startCommand = new Composer()

startCommand.command(['start'], async (ctx) => {
  logNewCommand(ctx)
  void runStartCommand(ctx)
})

startCommand.errorBoundary((err) => {
  console.error(`Error occurred in startCommand: ${String(err)}`)
})
