import botConfig from './config'
import { Bot } from 'grammy'
import { AdvConsole } from '../function/advancedConsole'
import { MsPrismaDbApi } from '../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../api/msLastfmApi/base'
import { BotFunctions } from './botFunctions/base'
import { CtxFunctions } from '../function/ctxFunctions'
import { MsGeniusApi } from '../api/msGeniusApi/base'
import { MsMusicApi } from '../api/msMusicApi/base'
import { MsOpenAiApi } from '../api/msOpenAiApi/base'
import config from '../config'

export class MelodyScoutBot {
  private readonly advConsole: AdvConsole
  private readonly bot: Bot
  private readonly botFunctions: BotFunctions
  private maintenanceMode = false

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi, msGeniusApi: MsGeniusApi, msMusicApi: MsMusicApi, msOpenAiApi: MsOpenAiApi) {
    this.advConsole = advConsole
    this.botFunctions = new BotFunctions(advConsole, ctxFunctions, msLastfmApi, msPrismaDbApi, msGeniusApi, msMusicApi, msOpenAiApi)
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
    this.bot.command(['maintenance'], async (ctx) => {
      const maintenanceCommandResponse = await this.botFunctions.maintenanceCommand.run(ctx)
      if (!maintenanceCommandResponse.success) return
      this.maintenanceMode = maintenanceCommandResponse.maintenanceMode
    })

    this.bot.command(['start'], async (ctx) => {
      void this.botFunctions.startCommand.run(ctx)
    })

    this.bot.command(['help'], async (ctx) => {
      void this.botFunctions.helpCommand.run(ctx)
    })

    this.bot.command(['contact'], async (ctx) => {
      void this.botFunctions.contactCommand.run(ctx)
    })

    this.bot.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.myuserCommand.run(ctx)
    })

    this.bot.command(['forgetme'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.forgetmeCommand.run(ctx)
    })

    this.bot.command(['brief'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.briefCommand.run(ctx)
    })

    this.bot.command(['playingnow', 'pn', 'listeningnow'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.playingnowCommand.run(ctx)
    })

    this.bot.command(['history'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.historyCommand.run(ctx)
    })

    this.bot.command(['pin'], async (ctx) => {
      void this.botFunctions.pinCommand.run(ctx)
    })

    this.bot.command(['pntrack'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.pntrackCommand.run(ctx)
    })

    this.bot.command(['pnalbum'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.pnalbumCommand.run(ctx)
    })

    this.bot.command(['pnartist'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.pnartistCommand.run(ctx)
    })

    this.bot.command(['allusers'], async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.allusersCommand.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TP${config.melodyScout.divider}`), async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.trackpreviewCallback.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TL${config.melodyScout.divider}`), async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.tracklyricsCallback.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TTL${config.melodyScout.divider}`), async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.translatedtracklyricsCallback.run(ctx)
    })

    this.bot.callbackQuery('PLAYINGNOW', async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.playingnowCallback.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TLE${config.melodyScout.divider}`), async (ctx) => {
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.tracklyricsexplanationCallback.run(ctx)
    })

    this.advConsole.log('MelodyScout_Bot - Listening')
  }
}
