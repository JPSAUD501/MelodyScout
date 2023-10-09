import { startMelodyScoutLogBot } from './MelodyScoutLog_Bot/bot'
import { startMelodyScoutBot } from './MelodyScout_Bot/bot'
import { Server } from './Server/server'
import { advLog } from './functions/advancedConsole'

async function start (): Promise<void> {
  advLog('Running the start sequence...')
  const melodyScoutLogBot = await startMelodyScoutLogBot()
  const melodyScoutBot = await startMelodyScoutBot()
  const server = new Server()
  await server.start(melodyScoutLogBot.getBotInfo, melodyScoutBot.getBotInfo)
  advLog('Start sequence completed')
}

start().catch((err) => {
  console.error(`Error: ${String(err)}`)
})
