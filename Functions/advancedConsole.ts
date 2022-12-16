import { Telegraf } from "telegraf";
import { TrackerManLogBot } from "../TrackerManLog_Bot/bot";
import config from "../TrackerMan_Bot/config";

export class AdvConsole {
  bot: TrackerManLogBot;

  constructor (bot: TrackerManLogBot) {
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