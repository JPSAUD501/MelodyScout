import { Composer } from 'grammy'
import { melodyScoutConfig } from '../../../config'
import { maintenanceMode } from '../../bot'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { runTrackAudioDownloadCallback } from '../../botFunctions/callbacks/trackaudiodownload'
import { logNewCallbackQuery } from '../../logFunctions'

export const trackaudiodownloadCallback = new Composer()

trackaudiodownloadCallback.callbackQuery(new RegExp(`^TAD${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runTrackAudioDownloadCallback(ctx)
})

trackaudiodownloadCallback.errorBoundary((err) => {
  console.error(`Error occurred in trackaudiodownloadCallback: ${String(err)}`)
})
