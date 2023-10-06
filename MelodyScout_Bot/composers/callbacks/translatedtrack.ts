import { Composer } from 'grammy'
import { melodyScoutConfig } from '../../../config'
import { maintenanceMode } from '../../bot'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { runTranslatedtracklyricsCallback } from '../../botFunctions/callbacks/translatedtracklyrics'
import { logNewCallbackQuery } from '../../logFunctions'

export const translatedtrackCallback = new Composer()

translatedtrackCallback.callbackQuery(new RegExp(`^TTL${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runTranslatedtracklyricsCallback(ctx)
})

translatedtrackCallback.errorBoundary((err) => {
  console.error(`Error occurred in translatedtrackCallback: ${String(err)}`)
})
