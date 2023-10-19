import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runPlayingnowCommand } from '../../botFunctions/commands/playingnow'
import { maintenanceMode, msPrismaDbApi } from '../../bot'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'

export const playingnowCommand = new Composer()

playingnowCommand.command(['playingnow', 'pn', 'listeningnow'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runPlayingnowCommand(msPrismaDbApi, ctx)
})

playingnowCommand.errorBoundary((err) => {
  console.error(`Error occurred in playingnowCommand: ${String(err)}`)
})
