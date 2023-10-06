import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runContactCommand } from '../../botFunctions/commands/contact'

export const contactCommand = new Composer()

contactCommand.command(['contact'], async (ctx) => {
  logNewCommand(ctx)
  void runContactCommand(ctx)
})
