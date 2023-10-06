import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runPnalbumCommand } from '../../botFunctions/commands/pnalbum'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'
import { maintenanceMode, msMusicApi, msPrismaDbApi } from '../../bot'

export const pnalbumCommand = new Composer()

pnalbumCommand.command(['pnalbum'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runPnalbumCommand(msMusicApi, msPrismaDbApi, ctx)
})

pnalbumCommand.errorBoundary((err) => {
  console.error(`Error occurred in pnalbumCommand: ${String(err)}`)
})
