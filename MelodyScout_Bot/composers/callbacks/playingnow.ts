import { Composer } from 'grammy'
import { maintenanceMode, msMusicApi, msPrismaDbApi } from '../../bot'
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
  void runPlayingnowCallback(msMusicApi, msPrismaDbApi, ctx)
})
