import { Composer } from 'grammy'
import { runTrackDownloadCallback } from '../../botFunctions/callbacks/trackdownload'
import { melodyScoutConfig } from '../../../config'
import { logNewCallbackQuery } from '../../logFunctions'
import { maintenanceMode } from '../../bot'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'

export const trackdownloadCallback = new Composer()

trackdownloadCallback.callbackQuery(new RegExp(`^TD${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runTrackDownloadCallback(ctx)
})
