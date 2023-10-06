import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runHistoryCommand } from '../../botFunctions/commands/history'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'
import { maintenanceMode, msPrismaDbApi } from '../../bot'

export const historyCommand = new Composer()

historyCommand.command(['history'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runHistoryCommand(msPrismaDbApi, ctx)
})
