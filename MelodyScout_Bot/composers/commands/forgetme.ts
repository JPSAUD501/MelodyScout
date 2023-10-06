import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runForgetmeCommand } from '../../botFunctions/commands/forgetme'
import { maintenanceMode, msPrismaDbApi } from '../../bot'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'

export const forgetmeCommand = new Composer()

forgetmeCommand.command(['forgetme'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runForgetmeCommand(msPrismaDbApi, ctx)
})

forgetmeCommand.errorBoundary((err) => {
  console.error(`Error occurred in forgetmeCommand: ${String(err)}`)
})
