import { Composer } from 'grammy'
import { melodyScoutConfig } from '../../../config'
import { maintenanceMode } from '../../bot'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { runTracklyricsexplanationCallback } from '../../botFunctions/callbacks/tracklyricsexplanation'
import { logNewCallbackQuery } from '../../logFunctions'

export const tracklyricsexplanationCallback = new Composer()

tracklyricsexplanationCallback.callbackQuery(new RegExp(`^TLE${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runTracklyricsexplanationCallback(ctx)
})

tracklyricsexplanationCallback.errorBoundary((err) => {
  console.error(`Error occurred in tracklyricsexplanationCallback: ${String(err)}`)
})
