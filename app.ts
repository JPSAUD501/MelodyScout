import config from './config'
import { AdvConsole } from './function/advancedConsole'
import { PrismaDB } from './function/prismaDB/base'
import { MelodyScoutLogBot } from './MelodyScoutLog_Bot/bot'
import { MelodyScoutBot } from './MelodyScout_Bot/bot'
import { MsLastfmApi } from './api/msLastfmApi/base'
import { CtxFunctions } from './function/ctxFunctions'

async function start (): Promise<void> {
  console.log('Starting MelodyScoutLog_Bot and AdvConsole...')
  const melodyScoutLogBot = new MelodyScoutLogBot()
  melodyScoutLogBot.start()
  const advConsole = new AdvConsole(melodyScoutLogBot)
  console.log('MelodyScoutLog_Bot and AdvConsole started!')

  advConsole.log('Running the start sequence...')
  const prismaDB = new PrismaDB(advConsole)
  const msLastfmApi = new MsLastfmApi(config.lastfm.apiKey)
  const ctxFunctions = new CtxFunctions(advConsole)
  const melodyScoutBot = new MelodyScoutBot(advConsole, ctxFunctions, msLastfmApi, prismaDB)
  melodyScoutBot.start()
  melodyScoutBot.hear()
  advConsole.log('Start sequence completed')
}

start().catch((err) => {
  console.error(`Error: ${String(err)}`)
})
