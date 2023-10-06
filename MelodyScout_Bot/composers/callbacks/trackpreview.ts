import { Composer } from 'grammy'
import { logNewCallbackQuery } from '../../logFunctions'
import { runTrackpreviewCallback } from '../../botFunctions/callbacks/trackpreview'
import { maintenanceMode, msMusicApi } from '../../bot'
import { melodyScoutConfig } from '../../../config'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'

export const trackpreviewCallback = new Composer()

trackpreviewCallback.callbackQuery(new RegExp(`^TP${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runTrackpreviewCallback(msMusicApi, ctx)
})
