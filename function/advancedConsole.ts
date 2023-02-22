import { MelodyScoutLogBot } from '../MelodyScoutLog_Bot/bot'

export class AdvConsole {
  private readonly bot: MelodyScoutLogBot

  constructor (bot: MelodyScoutLogBot) {
    this.bot = bot
  }

  log (log: any): void {
    console.log(log)
    this.bot.sendLog(log)
  }

  info (info: any): void {
    console.info(info)
    this.bot.sendInfo(info)
  }

  error (error: any): void {
    console.error(error)
    this.bot.sendError(error)
  }
}
