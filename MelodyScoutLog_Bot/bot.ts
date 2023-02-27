import { Bot } from 'grammy'
import config from './config'
// import { apiThrottler } from '@grammyjs/transformer-throttler'
// import { run } from '@grammyjs/runner'

export class MelodyScoutLogBot {
  private readonly bot: Bot
  private readonly messageQueue: string[]

  constructor () {
    // const throttler = apiThrottler()
    this.bot = new Bot(config.telegram.token)
    // this.bot.api.config.use(throttler)
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

    // const runner = run(this.bot, 1, null, {
    //   retryInterval: 5000
    // })

    // const stopRunner = (): void => {
    //   if (runner.isRunning() === true) {
    //     runner.stop()
    //   }
    // }
    // process.once('SIGINT', stopRunner)
    // process.once('SIGTERM', stopRunner)

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

  sendInfo (info: any): void {
    this.messageQueue.push('🟠 - ' + String(info))
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
