import { Composer } from 'grammy'
import { logNewCallbackQuery } from '../../logFunctions'
import { maintenanceMode } from '../../bot'
import { melodyScoutConfig } from '../../../config'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { runTracklyricsCallback } from '../../botFunctions/callbacks/tracklyrics'

export const tracklyricsCallback = new Composer()

tracklyricsCallback.callbackQuery(new RegExp(`^TL${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runTracklyricsCallback(ctx)
})
