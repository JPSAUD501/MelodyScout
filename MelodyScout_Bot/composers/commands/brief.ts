import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runBriefCommand } from '../../botFunctions/commands/brief'
import { maintenanceMode, msPrismaDbApi } from '../../bot'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'

export const briefCommand = new Composer()

briefCommand.command(['brief'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runBriefCommand(msPrismaDbApi, ctx)
})

briefCommand.errorBoundary((err) => {
  console.error(`Error occurred in briefCommand: ${String(err)}`)
})
