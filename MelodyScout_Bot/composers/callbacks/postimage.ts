import { Composer } from 'grammy'
import { melodyScoutConfig } from '../../../config'
import { maintenanceMode } from '../../bot'
import { runMaintenanceinformCallback } from '../../botFunctions/callbacks/maintenanceinform'
import { logNewCallbackQuery } from '../../logFunctions'
import { runPostimageCallback } from '../../botFunctions/callbacks/postimage'

export const postimageCallback = new Composer()

postimageCallback.callbackQuery(new RegExp(`^PI${melodyScoutConfig.divider}`), async (ctx) => {
  logNewCallbackQuery(ctx)
  if (maintenanceMode.active) {
    void runMaintenanceinformCallback(ctx)
    return
  }
  void runPostimageCallback(ctx)
})

postimageCallback.errorBoundary((err) => {
  console.error(`Error occurred in postimageCallback: ${String(err)}`)
})
