import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runPinCommand } from '../../botFunctions/commands/pin'

export const pinCommand = new Composer()

pinCommand.command(['pin'], async (ctx) => {
  logNewCommand(ctx)
  void runPinCommand(ctx)
})

pinCommand.errorBoundary((err) => {
  console.error(`Error occurred in pinCommand: ${String(err)}`)
})
