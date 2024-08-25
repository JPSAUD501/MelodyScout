import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { maintenanceMode, msPrismaDbApi } from '../../bot'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'
import { runCollageCommand } from '../../botFunctions/commands/collage'

export const collageCommand = new Composer()

collageCommand.command(['collage'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runCollageCommand(msPrismaDbApi, ctx)
})

collageCommand.errorBoundary((err) => {
  console.error(`Error occurred in collageCommand: ${String(err)}`)
})
