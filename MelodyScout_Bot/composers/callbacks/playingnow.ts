import { Composer } from 'grammy'
import { maintenanceMode, msPrismaDbApi } from '../../bot'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { runPlayingnowCallback } from '../../botFunctions/callbacks/playingnow'
import { logNewCallbackQuery } from '../../logFunctions'

export const playingnowCallback = new Composer()

playingnowCallback.callbackQuery('PLAYINGNOW', async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runPlayingnowCallback(msPrismaDbApi, ctx)
})

playingnowCallback.errorBoundary((err) => {
  console.error(`Error occurred in playingnowCallback: ${String(err)}`)
})
