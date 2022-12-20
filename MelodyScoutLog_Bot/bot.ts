import { Bot } from 'grammy';
import config from './config';

export class MelodyScoutLogBot {
  private bot: Bot;
  private messageQueue: string[];

  constructor() {
    this.bot = new Bot(config.telegram.token);
    this.messageQueue = [];

    console.log(`MelodyScoutLog_Bot - Loaded`);
  }

  async start() {
    this.bot.start().catch((err) => {
      console.error(err);
      console.error(`MelodyScoutLog_Bot - Error`);
    });
    this.startLogQueue();

    console.log(`MelodyScoutLog_Bot - Started`);
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
        await this.bot.api.sendMessage(config.telegram.logChannel, message);
      } catch (error) {
        console.log(error);
      }
    } , 1000);
  }
}