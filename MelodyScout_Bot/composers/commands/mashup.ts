import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runMashupCommand } from '../../botFunctions/commands/mashup'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'
import { maintenanceMode, msMusicApi, msPrismaDbApi } from '../../bot'

export const mashupCommand = new Composer()

mashupCommand.command(['mashup'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runMashupCommand(msMusicApi, msPrismaDbApi, ctx)
})

mashupCommand.errorBoundary((err) => {
  console.error(`Error occurred in mashupCommand: ${String(err)}`)
})
