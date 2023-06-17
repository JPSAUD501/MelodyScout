import { Bot } from 'grammy'
import config from './config'

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
    })

    this.bot.catch((err) => {
      console.error(err)
      console.error('MelodyScoutLog_Bot - Error')
    })

    this.startLogQueue()

    console.log('MelodyScoutLog_Bot - Started')
  }

  async getBotInfo (): Promise<void> {
    await this.bot.api.getMe().catch((err) => {
      console.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
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
    }, 1000)
  }
}
