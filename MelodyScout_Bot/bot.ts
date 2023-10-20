import botConfig from './config'
import { type Api, Bot, type Context, type RawApi } from 'grammy'
import { advError, advLog } from '../functions/advancedConsole'
import { MsPrismaDbApi } from '../api/msPrismaDbApi/base'
import { startCommand } from './composers/commands/start'
import { maintenanceCommand } from './composers/commands/maintenance'
import { helpCommand } from './composers/commands/help'
import { contactCommand } from './composers/commands/contact'
import { myuserCommand } from './composers/commands/myuser'
import { forgetmeCommand } from './composers/commands/forgetme'
import { playingnowCommand } from './composers/commands/playingnow'
import { historyCommand } from './composers/commands/history'
import { pinCommand } from './composers/commands/pin'
import { pntrackCommand } from './composers/commands/pntrack'
import { pnalbumCommand } from './composers/commands/pnalbum'
import { pnartistCommand } from './composers/commands/pnartist'
import { allusersCommand } from './composers/commands/allusers'
import { mashupCommand } from './composers/commands/mashup'
import { briefCommand } from './composers/commands/brief'
import { trackpreviewCallback } from './composers/callbacks/trackpreview'
import { tracklyricsCallback } from './composers/callbacks/tracklyrics'
import { translatedtrackCallback } from './composers/callbacks/translatedtrack'
import { playingnowCallback } from './composers/callbacks/playingnow'
import { tracklyricsexplanationCallback } from './composers/callbacks/tracklyricsexplanation'
import { trackdownloadCallback } from './composers/callbacks/trackdownload'
import { trackaudiodownloadCallback } from './composers/callbacks/trackaudiodownload'
import { trackvideodownloadCallback } from './composers/callbacks/trackvideodownload'
import { tracksearchInline } from './composers/inlines/tracksearch'
import { callbackDefault } from './composers/defaults/callback'
import { inlineDefault } from './composers/defaults/inline'
import { messageDefault } from './composers/defaults/message'
import { type GetBotInfoResponse } from '../types'
import { postimageCallback } from './composers/callbacks/postimage'

export const maintenanceMode = {
  active: false
}
export const msPrismaDbApi = new MsPrismaDbApi()

export async function startMelodyScoutBot (): Promise<{
  getBotInfo: () => Promise<GetBotInfoResponse>
}> {
  const bot = new Bot(botConfig.telegram.token)
  bot.use(maintenanceCommand)
  bot.use(startCommand)
  bot.use(helpCommand)
  bot.use(contactCommand)
  bot.use(myuserCommand)
  bot.use(forgetmeCommand)
  bot.use(playingnowCommand)
  bot.use(historyCommand)
  bot.use(pinCommand)
  bot.use(pntrackCommand)
  bot.use(pnalbumCommand)
  bot.use(pnartistCommand)
  bot.use(allusersCommand)
  bot.use(mashupCommand)
  bot.use(briefCommand)
  bot.use(trackpreviewCallback)
  bot.use(tracklyricsCallback)
  bot.use(translatedtrackCallback)
  bot.use(playingnowCallback)
  bot.use(tracklyricsexplanationCallback)
  bot.use(trackdownloadCallback)
  bot.use(trackaudiodownloadCallback)
  bot.use(trackvideodownloadCallback)
  bot.use(postimageCallback)
  bot.use(tracksearchInline)
  bot.use(callbackDefault)
  bot.use(inlineDefault)
  bot.use(messageDefault)
  bot.start().catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
    advError('MelodyScout_Bot - Restarting in 20 seconds')
    void new Promise((resolve) => setTimeout(resolve, 20000)).then(() => {
      process.exit(1)
    })
  })
  bot.catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
    process.exit(5)
  })
  bot.api.setMyCommands([
    { command: 'start', description: 'Hello! I\'m MelodyScout' },
    { command: 'help', description: 'Show help message' },
    { command: 'contact', description: 'Contact the bot owner' },
    { command: 'myuser', description: 'Set your Last.fm user' },
    { command: 'forgetme', description: 'Forget your Last.fm user' },
    { command: 'brief', description: 'Show the brief of your Last.fm user' },
    { command: 'playingnow', description: 'Show the currently playing track' },
    { command: 'history', description: 'Show the history of your listened tracks' },
    { command: 'mashup', description: 'Create a mashup of your 2 last listened tracks' },
    { command: 'pin', description: 'Pin a shortcut to the /playingnow command' },
    { command: 'pntrack', description: 'Show information about the currently playing track' },
    { command: 'pnalbum', description: 'Show information about the album of the currently playing track' },
    { command: 'pnartist', description: 'Show information about the artist of the currently playing track' }
  ]).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  process.once('SIGINT', () => {
    void bot.stop()
  })
  process.once('SIGTERM', () => {
    void bot.stop()
  })
  advLog('MelodyScout_Bot - Started')
  return {
    getBotInfo: getBotInfo.bind(null, bot)
  }
}

async function getBotInfo (bot: Bot<Context, Api<RawApi>>): Promise<GetBotInfoResponse> {
  const botInfo = await bot.api.getMe().catch((err) => {
    return Error(`Error getting MelodyScout_Bot info: ${String(err)}`)
  })
  if (botInfo instanceof Error) {
    advError(`MelodyScout_Bot - Error: ${String(botInfo.message)}`)
    return {
      success: false,
      error: botInfo.message
    }
  }
  return {
    success: true,
    botInfo
  }
}
