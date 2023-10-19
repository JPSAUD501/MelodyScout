import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runPntrackCommand } from '../../botFunctions/commands/pntrack'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'
import { maintenanceMode, msPrismaDbApi } from '../../bot'

export const pntrackCommand = new Composer()

pntrackCommand.command(['pntrack'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runPntrackCommand(msPrismaDbApi, ctx)
})

pntrackCommand.errorBoundary((err) => {
  console.error(`Error occurred in pntrackCommand: ${String(err)}`)
})
