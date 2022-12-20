import { MelodyScoutLogBot } from "../MelodyScoutLog_Bot/bot";

export class AdvConsole {
  bot: MelodyScoutLogBot;

  constructor (bot: MelodyScoutLogBot) {
    this.bot = bot;
  }

  log (log: any) {
    console.log(log);
    this.bot.sendLog(log);
  }

  error (error: any) {
    console.error(error);
    this.bot.sendError(error);
  }
}