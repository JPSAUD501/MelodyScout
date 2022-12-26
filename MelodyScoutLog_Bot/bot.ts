import { Bot } from 'grammy'
import config from './config'

export class MelodyScoutLogBot {
  private readonly bot: Bot
  private readonly messageQueue: string[]

  constructor () {
    this.bot = new Bot(config.telegram.token)
    this.messageQueue = []

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

  sendLog (log: any): void {
    this.messageQueue.push('🔵 - ' + String(log))
  }

  sendError (error: any): void {
    this.messageQueue.push('🔴 - ' + String(error))
  }

  startLogQueue (): void {
    setInterval(() => {
      if (this.messageQueue.length <= 0) return
      try {
        const message = this.messageQueue.shift()
        this.bot.api.sendMessage(config.telegram.logChannel, message !== undefined ? message : '⚠').catch((err) => {
          console.error(err)
        })
      } catch (error) {
        console.log(error)
      }
    })
  }
}
