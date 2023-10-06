import { type Api, Bot, type Context, type RawApi } from 'grammy'
import config from './config'
import { type GetBotInfoResponse } from '../types'

export const messageQueue: string[] = []

export async function startMelodyScoutLogBot (): Promise<{
  getBotInfo: () => Promise<GetBotInfoResponse>
}> {
  const bot = new Bot(config.telegram.token)
  bot.start().catch((err) => {
    console.error(err)
    console.error('MelodyScoutLog_Bot - Error')
    process.exit(3)
  })
  bot.catch((err) => {
    console.error(err)
    console.error('MelodyScoutLog_Bot - Error')
    process.exit(4)
  })
  startLogQueue(bot)
  process.once('SIGINT', () => {
    void bot.stop()
  })
  process.once('SIGTERM', () => {
    void bot.stop()
  })
  console.log('MelodyScoutLog_Bot - Started')
  return {
    getBotInfo: getBotInfo.bind(null, bot)
  }
}

function startLogQueue (bot: Bot<Context, Api<RawApi>>): void {
  setInterval(() => {
    if (messageQueue.length <= 0) return
    try {
      const message = messageQueue.shift()
      bot.api.sendMessage(config.telegram.logChannel, message ?? '⚠').catch((err) => {
        console.error(err)
      })
    } catch (error) {
      console.log(error)
    }
  }, 3000)
}

async function getBotInfo (bot: Bot<Context, Api<RawApi>>): Promise<GetBotInfoResponse> {
  const botInfo = await bot.api.getMe().catch((err) => {
    return Error(`Error getting MelodyScoutLog_Bot info: ${String(err)}`)
  })
  if (botInfo instanceof Error) {
    console.error(`MelodyScoutLog_Bot - Error: ${String(botInfo.message)}`)
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
