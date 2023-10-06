import { Composer } from 'grammy'
import { logNewCommand } from '../../logFunctions'
import { runMyuserCommand } from '../../botFunctions/commands/myuser'
import { maintenanceMode, msPrismaDbApi } from '../../bot'
import { runMaintenanceinformCommand } from '../../botFunctions/commands/maintenanceinform'

export const myuserCommand = new Composer()

myuserCommand.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
  logNewCommand(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCommand(ctx)
    return
  }
  void runMyuserCommand(msPrismaDbApi, ctx)
})
