import { AdvConsole } from './function/advancedConsole'
import { MsPrismaDbApi } from './api/msPrismaDbApi/base'
import { MelodyScoutLogBot } from './MelodyScoutLog_Bot/bot'
import { MelodyScoutBot } from './MelodyScout_Bot/bot'
import { MsLastfmApi } from './api/msLastfmApi/base'
import { CtxFunctions } from './function/ctxFunctions'
import { MsGeniusApi } from './api/msGeniusApi/base'
import { MsMusicApi } from './api/msMusicApi/base'
import { MsOpenAiApi } from './api/msOpenAiApi/base'
import { MsTextToSpeechApi } from './api/msTextToSpeechApi/base'
import { geniusConfig, lastfmConfig, openaiConfig, spotifyConfig } from './config'
import { Server } from './Server/server'

async function start (): Promise<void> {
  console.log('Starting MelodyScoutLog_Bot and AdvConsole...')
  const melodyScoutLogBot = new MelodyScoutLogBot()
  melodyScoutLogBot.start()
  await melodyScoutLogBot.getBotInfo()
  const advConsole = new AdvConsole(melodyScoutLogBot)
  console.log('MelodyScoutLog_Bot and AdvConsole started!')

  console.log('Starting Server...')
  const server = new Server(advConsole)
  await server.start()
  console.log('Server started!')

  advConsole.log('Running the start sequence...')
  const msPrismaDbApi = new MsPrismaDbApi(advConsole)
  const msLastfmApi = new MsLastfmApi(advConsole, lastfmConfig.apiKey)
  const msGeniusApi = new MsGeniusApi(advConsole, geniusConfig.accessToken)
  const msOpenAiApi = new MsOpenAiApi(advConsole, openaiConfig.apiKey)
  const msMusicApi = new MsMusicApi(advConsole, spotifyConfig.clientID, spotifyConfig.clientSecret)
  const msTextToSpeechApi = new MsTextToSpeechApi(advConsole)
  await msMusicApi.start()
  const ctxFunctions = new CtxFunctions(advConsole)
  const melodyScoutBot = new MelodyScoutBot(advConsole, ctxFunctions, msLastfmApi, msPrismaDbApi, msGeniusApi, msMusicApi, msOpenAiApi, msTextToSpeechApi)
  melodyScoutBot.start()
  await melodyScoutBot.getBotInfo()
  melodyScoutBot.hear()
  advConsole.log('Start sequence completed')
}

start().catch((err) => {
  console.error(`Error: ${String(err)}`)
})
