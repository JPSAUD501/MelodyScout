import { Composer } from 'grammy'
import { melodyScoutConfig } from '../../../config'
import { maintenanceMode } from '../../bot'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { runTrackVideoDownloadCallback } from '../../botFunctions/callbacks/trackvideodownload'
import { logNewCallbackQuery } from '../../logFunctions'

export const trackvideodownloadCallback = new Composer()

trackvideodownloadCallback.callbackQuery(new RegExp(`^TVD${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runTrackVideoDownloadCallback(ctx)
})

trackvideodownloadCallback.errorBoundary((err) => {
  console.error(`Error occurred in trackvideodownloadCallback: ${String(err)}`)
})
