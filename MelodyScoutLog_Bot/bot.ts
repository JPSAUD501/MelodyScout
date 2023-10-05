import { Bot } from 'grammy'
import config from './config'
import { UserFromGetMe } from 'grammy/types'

export const messageQueue: string[] = []

export class MelodyScoutLogBot {
  private readonly bot: Bot

  constructor () {
    this.bot = new Bot(config.telegram.token)

    console.log('MelodyScoutLog_Bot - Loaded')
  }

  start (): void {
    this.bot.start().catch((err) => {
      console.error(err)
      console.error('MelodyScoutLog_Bot - Error')
      process.exit(3)
    })

    this.bot.catch((err) => {
      console.error(err)
      console.error('MelodyScoutLog_Bot - Error')
      process.exit(4)
    })

    this.startLogQueue()

    console.log('MelodyScoutLog_Bot - Started')
  }

  async getBotInfo (): Promise<{
    success: false
    error: string
  } | {
    success: true
    botInfo: UserFromGetMe
  }> {
    const botInfo = await this.bot.api.getMe().catch((err) => {
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

  startLogQueue (): void {
    setInterval(() => {
      if (messageQueue.length <= 0) return
      try {
        const message = messageQueue.shift()
        this.bot.api.sendMessage(config.telegram.logChannel, message !== undefined ? message : '⚠').catch((err) => {
          console.error(err)
        })
      } catch (error) {
        console.log(error)
      }
    }, 3000)
  }
}
