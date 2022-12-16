import { Telegraf } from 'telegraf';
import config from './config';

export class TrackerManLogBot {
  bot: Telegraf;
  messageQueue: string[];

  constructor() {
    this.bot = new Telegraf(config.telegram.token);
    this.messageQueue = [];

    console.log(`TrackerManLog_Bot - Loaded`);
  }

  async start() {
    await this.bot.launch();

    this.startLogQueue();

    console.log(`TrackerManLog_Bot - Started`);

    process.once('SIGINT', () => this.bot.stop('SIGINT'))
    process.once('SIGTERM', () =>this.bot.stop('SIGTERM'))
  }

  sendLog(log: any) {
    this.messageQueue.push('🔵 - ' + log.toString());
  }

  sendError(error: any) {
    this.messageQueue.push('🔴 - ' + error.toString());
  }

  startLogQueue() {
    setInterval(async () => {
      if (this.messageQueue.length <= 0) return;
      try {
        const message = this.messageQueue.shift() || '⚠';
        await this.bot.telegram.sendMessage(config.telegram.logChannel, message);
      } catch (error) {
        console.log(error);
      }
    } , 1000);
  }
}