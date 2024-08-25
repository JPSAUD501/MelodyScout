import { Composer } from 'grammy'
import { logNewCallbackQuery } from '../../logFunctions'
import { maintenanceMode, msPrismaDbApi } from '../../bot'
import { melodyScoutConfig } from '../../../config'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { runCollageCallback } from '../../botFunctions/callbacks/collage'

export const collageCallback = new Composer()

collageCallback.callbackQuery(new RegExp(`^CLG${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runCollageCallback(msPrismaDbApi, ctx)
})

collageCallback.errorBoundary((err) => {
  console.error(`Error occurred in collageCallback: ${String(err)}`)
})
