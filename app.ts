
import { MelodyScoutLogBot } from './MelodyScoutLog_Bot/bot'
import { MelodyScoutBot } from './MelodyScout_Bot/bot'
import { Server } from './Server/server'
import { advLog } from './function/advancedConsole'

async function start (): Promise<void> {
  advLog('Starting MelodyScoutLog_Bot and AdvConsole...')
  const melodyScoutLogBot = new MelodyScoutLogBot()
  melodyScoutLogBot.start()
  await melodyScoutLogBot.getBotInfo()
  advLog('MelodyScoutLog_Bot and AdvConsole started!')

  advLog('Starting Server...')
  const server = new Server()
  await server.start()
  advLog('Server started!')

  advLog('Running the start sequence...')
  const melodyScoutBot = new MelodyScoutBot()
  await melodyScoutBot.start()
  await melodyScoutBot.getBotInfo()
  melodyScoutBot.hear()
  advLog('Start sequence completed')
}

start().catch((err) => {
  console.error(`Error: ${String(err)}`)
})
