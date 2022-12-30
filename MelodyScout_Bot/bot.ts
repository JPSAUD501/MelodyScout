import botConfig from './config'
import { Bot } from 'grammy'
import { AdvConsole } from '../function/advancedConsole'
import { PrismaDB } from '../function/prismaDB/base'
import { MsLastfmApi } from '../api/msLastfmApi/base'
import { BotFunctions } from './botFunctions/base'
import { CtxFunctions } from '../function/ctxFunctions'
import { MsGeniusApi } from '../api/msGeniusApi/base'
import { MsMusicApi } from '../api/msMusicApi/base'

export class MelodyScoutBot {
  private readonly advConsole: AdvConsole
  private readonly bot: Bot
  private readonly botFunctions: BotFunctions

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB, msGeniusApi: MsGeniusApi, msMusicApi: MsMusicApi) {
    this.advConsole = advConsole
    this.botFunctions = new BotFunctions(advConsole, ctxFunctions, msLastfmApi, prismaDB, msGeniusApi, msMusicApi)
    this.bot = new Bot(botConfig.telegram.token)

    console.log('MelodyScout_Bot - Loaded')
  }

  start (): void {
    this.bot.start().catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })

    this.bot.catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })

    this.bot.api.setMyCommands([
      { command: 'start', description: 'Hello! I\'m MelodyScout' },
      { command: 'help', description: 'Show help message' },
      { command: 'contact', description: 'Contact the bot owner' },
      { command: 'track', description: 'Track a new user Last.fm in this chat' },
      { command: 'untrack', description: 'Untrack a user Last.fm in this chat' },
      { command: 'tracklist', description: 'Show the list of tracked users Last.fm in this chat' },
      { command: 'myuser', description: 'Set your Last.fm user' },
      { command: 'forgetme', description: 'Forget your Last.fm user' },
      { command: 'brief', description: 'Show the brief of your Last.fm user' },
      { command: 'playingnow', description: 'Show the currently playing track' },
      { command: 'history', description: 'Show the history of your listened tracks' },
      { command: 'pin', description: 'Pin a shortcut to the /playingnow command' },
      { command: 'pntrack', description: 'Show information about the currently playing track' },
      { command: 'pnalbum', description: 'Show information about the album of the currently playing track' },
      { command: 'pnartist', description: 'Show information about the artist of the currently playing track' }
    ]).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })

    this.advConsole.log('MelodyScout_Bot - Started')
  }

  async getBotInfo (): Promise<void> {
    await this.bot.api.getMe().catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  hear (): void {
    this.bot.command('start', async (ctx) => {
      void this.botFunctions.startCommand.run(ctx)
    })

    this.bot.command('help', async (ctx) => {
      void this.botFunctions.helpCommand.run(ctx)
    })

    this.bot.command('track', async (ctx) => {
      void this.botFunctions.trackCommand.run(ctx)
    })

    this.bot.command('untrack', async (ctx) => {
      void this.botFunctions.untrackCommand.run(ctx)
    })

    this.bot.command('tracklist', async (ctx) => {
      void this.botFunctions.tracklistCommand.run(ctx)
    })

    this.bot.command('contact', async (ctx) => {
      void this.botFunctions.contactCommand.run(ctx)
    })

    this.bot.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      void this.botFunctions.myuserCommand.run(ctx)
    })

    this.bot.command('forgetme', async (ctx) => {
      void this.botFunctions.forgetmeCommand.run(ctx)
    })

    this.bot.command('brief', async (ctx) => {
      void this.botFunctions.briefCommand.run(ctx)
    })

    this.bot.command(['playingnow', 'pn', 'listeningnow', 'ln'], async (ctx) => {
      void this.botFunctions.playingnowCommand.run(ctx)
    })

    this.bot.command('history', async (ctx) => {
      void this.botFunctions.historyCommand.run(ctx)
    })

    this.bot.command('lyrics', async (ctx) => {
      void this.botFunctions.lyricsCommand.run(ctx)
    })

    this.bot.command('pin', async (ctx) => {
      void this.botFunctions.pinCommand.run(ctx)
    })

    this.bot.command(['pntrack', 'trk'], async (ctx) => {
      void this.botFunctions.pntrackCommand.run(ctx)
    })

    this.bot.command(['pnalbum', 'alb'], async (ctx) => {
      void this.botFunctions.pnalbumCommand.run(ctx)
    })

    this.bot.command(['pnartist', 'art'], async (ctx) => {
      void this.botFunctions.pnartistCommand.run(ctx)
    })

    this.bot.callbackQuery(/^TP/, async (ctx) => {
      void this.botFunctions.trackpreviewCallback.run(ctx)
    })

    this.bot.callbackQuery(/^TL/, async (ctx) => {
      void this.botFunctions.tracklyricsCallback.run(ctx)
    })

    this.bot.callbackQuery(/^TTL/, async (ctx) => {
      void this.botFunctions.translatedtracklyricsCallback.run(ctx)
    })

    this.bot.callbackQuery('PLAYINGNOW', async (ctx) => {
      void this.botFunctions.playingnowCallback.run(ctx)
    })

    this.advConsole.log('MelodyScout_Bot - Listening')
  }
}
