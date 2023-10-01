
import { MelodyScoutLogBot } from './MelodyScoutLog_Bot/bot'
import { MelodyScoutBot } from './MelodyScout_Bot/bot'
import { Server } from './Server/server'
import { advLog } from './function/advancedConsole'

async function start (): Promise<void> {
  advLog('Running the start sequence...')
  const melodyScoutLogBot = new MelodyScoutLogBot()
  melodyScoutLogBot.start()
  await melodyScoutLogBot.getBotInfo()
  const melodyScoutBot = new MelodyScoutBot()
  await melodyScoutBot.start()
  await melodyScoutBot.getBotInfo()
  const server = new Server()
  await server.start(melodyScoutLogBot, melodyScoutBot)
  advLog('Start sequence completed')
}

start().catch((err) => {
  console.error(`Error: ${String(err)}`)
})
