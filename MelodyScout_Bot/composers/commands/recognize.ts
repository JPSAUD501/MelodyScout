import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runRecognizeCommand } from '../../botFunctions/commands/recognize'
import { maintenanceMode } from '../../bot'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'

export const recognizeCommand = new Composer()

recognizeCommand.command(['recognize', 'r'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runRecognizeCommand(ctx)
})

recognizeCommand.errorBoundary((err) => {
  console.error(`Error occurred in recognizeCommand: ${String(err)}`)
})
