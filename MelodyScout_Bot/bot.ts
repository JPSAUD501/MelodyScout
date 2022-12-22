import config from './config';
import { Bot, CommandContext, Context } from 'grammy'
import { AdvConsole } from '../functions/advancedConsole';
import { PrismaDB } from '../functions/prismaDB/base';
import { MsLastfmApi } from '../api/msLastfmApi/base';
import { CtxFunctions } from '../functions/ctxFunctions';
import { BotCommands } from './botCommands/base';

export class MelodyScoutBot {
  private advConsole: AdvConsole;
  private bot: Bot
  private msLastfmApi: MsLastfmApi;
  private prismaDB: PrismaDB;
  private botCommands: BotCommands

  constructor(advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB) {
    this.advConsole = advConsole;
    this.msLastfmApi = msLastfmApi;
    this.prismaDB = prismaDB;
    this.botCommands = new BotCommands(advConsole, ctxFunctions, msLastfmApi, prismaDB);
    this.bot = new Bot(config.telegram.token);

    console.log(`MelodyScout_Bot - Loaded`);
  }

  async start() {
    this.bot.start().catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${err}`);
    });

    this.advConsole.log(`MelodyScout_Bot - Started`);
  }

  async hear() {
    this.bot.command("start", async (ctx) => {
      this.botCommands.startCommand.run(ctx);
    });

    this.bot.command("help", async (ctx) => {
      this.botCommands.helpCommand.run(ctx);
    });

    this.bot.command("track" , async (ctx) => {
      this.botCommands.trackCommand.run(ctx);
    });

    this.bot.command('untrack', async (ctx) => {
      this.botCommands.untrackCommand.run(ctx);
    });

    this.bot.command('tracklist', async (ctx) => {
      this.botCommands.tracklistCommand.run(ctx);
    });

    this.bot.command('contact', async (ctx) => {
      this.botCommands.contactCommand.run(ctx);
    });

    this.bot.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      this.botCommands.myuserCommand.run(ctx);
    });

    this.bot.command('forgetme', async (ctx) => {
      this.botCommands.forgetmeCommand.run(ctx);
    });

    this.bot.command('brief', async (ctx) => {
      this.botCommands.briefCommand.run(ctx);
    });

    this.advConsole.log(`MelodyScout_Bot - Listening`);
  }
}