
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
import { MsRaveApi } from './api/msRaveApi/base'
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
  const msPrismaDbApi = new MsPrismaDbApi()
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const msGeniusApi = new MsGeniusApi(geniusConfig.accessToken)
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const msTextToSpeechApi = new MsTextToSpeechApi()
  const msRaveApi = new MsRaveApi()
  await msMusicApi.start()
  const ctxFunctions = new CtxFunctions()
  const melodyScoutBot = new MelodyScoutBot(ctxFunctions, msLastfmApi, msPrismaDbApi, msGeniusApi, msMusicApi, msOpenAiApi, msTextToSpeechApi, msRaveApi)
  melodyScoutBot.start()
  await melodyScoutBot.getBotInfo()
  melodyScoutBot.hear()
  advLog('Start sequence completed')
}

start().catch((err) => {
  console.error(`Error: ${String(err)}`)
})
