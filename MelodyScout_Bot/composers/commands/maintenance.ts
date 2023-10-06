import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runMaintenanceCommand } from '../../botFunctions/commands/maintenance'
import { maintenanceMode } from '../../bot'

export const maintenanceCommand = new Composer()

maintenanceCommand.command(['maintenance'], async (ctx) => {
  logNewCommand(ctx)
  const maintenanceCommandResponse = await runMaintenanceCommand(ctx)
  if (!maintenanceCommandResponse.success) return
  maintenanceMode.active = maintenanceCommandResponse.maintenanceMode
})
