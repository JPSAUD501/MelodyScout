import config from './config'
import { Bot } from 'grammy'
import { AdvConsole } from '../functions/advancedConsole'
import { PrismaDB } from '../functions/prismaDB/base'
import { MsLastfmApi } from '../api/msLastfmApi/base'
import { BotCommands } from './botCommands/base'
import { CtxFunctions } from '../functions/ctxFunctions'

export class MelodyScoutBot {
  private readonly advConsole: AdvConsole
  private readonly bot: Bot
  private readonly msLastfmApi: MsLastfmApi
  private readonly prismaDB: PrismaDB
  private readonly botCommands: BotCommands

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB) {
    this.advConsole = advConsole
    this.msLastfmApi = msLastfmApi
    this.prismaDB = prismaDB
    this.botCommands = new BotCommands(advConsole, ctxFunctions, msLastfmApi, prismaDB)
    this.bot = new Bot(config.telegram.token)

    console.log('MelodyScout_Bot - Loaded')
  }

  start (): void {
    this.bot.start().catch((err) => {
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
      { command: 'playingnow', description: 'Show the currently playing track of your Last.fm user' },
      { command: 'history', description: 'Show the history of your listened tracks' }
    ]).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })

    this.advConsole.log('MelodyScout_Bot - Started')
  }

  hear (): void {
    this.bot.command('start', async (ctx) => {
      await this.botCommands.startCommand.run(ctx)
    })

    this.bot.command('help', async (ctx) => {
      await this.botCommands.helpCommand.run(ctx)
    })

    this.bot.command('track', async (ctx) => {
      await this.botCommands.trackCommand.run(ctx)
    })

    this.bot.command('untrack', async (ctx) => {
      await this.botCommands.untrackCommand.run(ctx)
    })

    this.bot.command('tracklist', async (ctx) => {
      await this.botCommands.tracklistCommand.run(ctx)
    })

    this.bot.command('contact', async (ctx) => {
      await this.botCommands.contactCommand.run(ctx)
    })

    this.bot.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      await this.botCommands.myuserCommand.run(ctx)
    })

    this.bot.command('forgetme', async (ctx) => {
      await this.botCommands.forgetmeCommand.run(ctx)
    })

    this.bot.command('brief', async (ctx) => {
      await this.botCommands.briefCommand.run(ctx)
    })

    this.bot.command(['playingnow', 'pn', 'listeningnow', 'ln'], async (ctx) => {
      await this.botCommands.playingnowCommand.run(ctx)
    })

    this.bot.command('history', async (ctx) => {
      await this.botCommands.historyCommand.run(ctx)
    })

    this.advConsole.log('MelodyScout_Bot - Listening')
  }
}
