import botConfig from './config'
import { Bot } from 'grammy'
import { AdvConsole } from '../function/advancedConsole'
import { PrismaDB } from '../function/prismaDB/base'
import { MsLastfmApi } from '../api/msLastfmApi/base'
import { BotFunctions } from './botFunctions/base'
import { CtxFunctions } from '../function/ctxFunctions'
import { MsGeniusApi } from '../api/msGeniusApi/base'
import { MsSpotifyApi } from '../api/msSpotifyApi/base'

export class MelodyScoutBot {
  private readonly advConsole: AdvConsole
  private readonly bot: Bot
  private readonly msLastfmApi: MsLastfmApi
  private readonly prismaDB: PrismaDB
  private readonly botFunctions: BotFunctions
  private readonly msGeniusApi: MsGeniusApi
  private readonly msSpotifyApi: MsSpotifyApi

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB, msGeniusApi: MsGeniusApi, msSpotifyApi: MsSpotifyApi) {
    this.advConsole = advConsole
    this.msLastfmApi = msLastfmApi
    this.prismaDB = prismaDB
    this.msGeniusApi = msGeniusApi
    this.msSpotifyApi = msSpotifyApi
    this.botFunctions = new BotFunctions(advConsole, ctxFunctions, msLastfmApi, prismaDB, msGeniusApi, msSpotifyApi)
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
      { command: 'lyrics', description: 'Show the lyrics of the currently playing track' }
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
      await this.botFunctions.startCommand.run(ctx)
    })

    this.bot.command('help', async (ctx) => {
      await this.botFunctions.helpCommand.run(ctx)
    })

    this.bot.command('track', async (ctx) => {
      await this.botFunctions.trackCommand.run(ctx)
    })

    this.bot.command('untrack', async (ctx) => {
      await this.botFunctions.untrackCommand.run(ctx)
    })

    this.bot.command('tracklist', async (ctx) => {
      await this.botFunctions.tracklistCommand.run(ctx)
    })

    this.bot.command('contact', async (ctx) => {
      await this.botFunctions.contactCommand.run(ctx)
    })

    this.bot.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      await this.botFunctions.myuserCommand.run(ctx)
    })

    this.bot.command('forgetme', async (ctx) => {
      await this.botFunctions.forgetmeCommand.run(ctx)
    })

    this.bot.command('brief', async (ctx) => {
      await this.botFunctions.briefCommand.run(ctx)
    })

    this.bot.command(['playingnow', 'pn', 'listeningnow', 'ln'], async (ctx) => {
      await this.botFunctions.playingnowCommand.run(ctx)
    })

    this.bot.command('history', async (ctx) => {
      await this.botFunctions.historyCommand.run(ctx)
    })

    this.bot.command('lyrics', async (ctx) => {
      await this.botFunctions.lyricsCommand.run(ctx)
    })

    // `${botConfig.telegram.botId}getTrackPreview${msConfig.melodyScout.divider}${mainTrack.trackName}${msConfig.melodyScout.divider}${mainTrack.artistName}`
    this.bot.callbackQuery(/getTrackPreview/, async (ctx) => {
      await this.botFunctions.trackpreviewCallback.run(ctx)
    })

    this.advConsole.log('MelodyScout_Bot - Listening')
  }
}
