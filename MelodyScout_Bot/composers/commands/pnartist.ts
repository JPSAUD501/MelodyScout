import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runPnartistCommand } from '../../botFunctions/commands/pnartist'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'
import { maintenanceMode, msMusicApi, msPrismaDbApi } from '../../bot'

export const pnartistCommand = new Composer()

pnartistCommand.command(['pnartist'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runPnartistCommand(msMusicApi, msPrismaDbApi, ctx)
})

pnartistCommand.errorBoundary((err) => {
  console.error(`Error occurred in pnartistCommand: ${String(err)}`)
})
