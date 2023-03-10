import botConfig from './config'
import { Bot, CallbackQueryContext, CommandContext, Context } from 'grammy'
import { AdvConsole } from '../function/advancedConsole'
import { MsPrismaDbApi } from '../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../api/msLastfmApi/base'
import { BotFunctions } from './botFunctions/base'
import { CtxFunctions } from '../function/ctxFunctions'
import { MsGeniusApi } from '../api/msGeniusApi/base'
import { MsMusicApi } from '../api/msMusicApi/base'
import { MsOpenAiApi } from '../api/msOpenAiApi/base'
import config from '../config'
import { MsTextToSpeechApi } from '../api/msTextToSpeechApi/base'

export class MelodyScoutBot {
  private readonly advConsole: AdvConsole
  private readonly bot: Bot
  private readonly botFunctions: BotFunctions
  private maintenanceMode = false

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi, msGeniusApi: MsGeniusApi, msMusicApi: MsMusicApi, msOpenAiApi: MsOpenAiApi, msTextToSpeechApi: MsTextToSpeechApi) {
    this.advConsole = advConsole
    this.botFunctions = new BotFunctions(advConsole, ctxFunctions, msLastfmApi, msPrismaDbApi, msGeniusApi, msMusicApi, msOpenAiApi, msTextToSpeechApi)
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
      { command: 'collage', description: 'Show a collage of your top tracks' },
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

  logNewCommand (ctx: CommandContext<Context>): void {
    if (!((ctx.message?.text?.startsWith('/')) ?? false)) return
    const chatTittle = (ctx.chat.type === 'private') ? 'Private' : ctx.chat.title ?? 'Unknown'
    this.advConsole.log(`MelodyScout_Bot - New command:\nFrom: (${ctx.message?.from?.id ?? 'No ID'}) ${ctx.message?.from?.first_name ?? 'No name'} ${ctx.message?.from?.last_name ?? ''} - ${ctx.message?.from.username ?? 'No username'}\nIn: (${ctx.chat?.id}) ${chatTittle} - ${ctx.chat.type}\nCommand: ${ctx.message?.text ?? ''}`)
  }

  logNewCallbackQuery (ctx: CallbackQueryContext<Context>): void {
    const chatTittle = (ctx.chat?.type === 'private') ? 'Private' : ctx.chat?.title ?? 'Unknown'
    this.advConsole.log(`MelodyScout_Bot - New callback_query:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nIn: (${ctx.chat?.id ?? 'No ID'}) ${chatTittle} - ${ctx.chat?.type ?? 'No type'}\nData: ${ctx.callbackQuery?.data ?? 'No data'}`)
  }

  hear (): void {
    this.bot.command(['maintenance'], async (ctx) => {
      this.logNewCommand(ctx)
      const maintenanceCommandResponse = await this.botFunctions.maintenanceCommand.run(ctx)
      if (!maintenanceCommandResponse.success) return
      this.maintenanceMode = maintenanceCommandResponse.maintenanceMode
    })

    this.bot.command(['start'], async (ctx) => {
      this.logNewCommand(ctx)
      void this.botFunctions.startCommand.run(ctx)
    })

    this.bot.command(['help'], async (ctx) => {
      this.logNewCommand(ctx)
      void this.botFunctions.helpCommand.run(ctx)
    })

    this.bot.command(['contact'], async (ctx) => {
      this.logNewCommand(ctx)
      void this.botFunctions.contactCommand.run(ctx)
    })

    this.bot.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.myuserCommand.run(ctx)
    })

    this.bot.command(['forgetme'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.forgetmeCommand.run(ctx)
    })

    this.bot.command(['brief'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.briefCommand.run(ctx)
    })

    this.bot.command(['playingnow', 'pn', 'listeningnow'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.playingnowCommand.run(ctx)
    })

    this.bot.command(['history'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.historyCommand.run(ctx)
    })

    this.bot.command(['pin'], async (ctx) => {
      this.logNewCommand(ctx)
      void this.botFunctions.pinCommand.run(ctx)
    })

    this.bot.command(['pntrack'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.pntrackCommand.run(ctx)
    })

    this.bot.command(['pnalbum'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.pnalbumCommand.run(ctx)
    })

    this.bot.command(['pnartist'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCommand.run(ctx)
        return
      }
      void this.botFunctions.pnartistCommand.run(ctx)
    })

    this.bot.command(['allusers'], async (ctx) => {
      this.logNewCommand(ctx)
      void this.botFunctions.allusersCommand.run(ctx)
    })

    // this.bot.command(['collage'], async (ctx) => {
    // this.logNewCommand(ctx)
    // if (this.maintenanceMode) {
    //   void this.botFunctions.maintenanceinformCommand.run(ctx)
    //   return
    // }
    // void this.botFunctions.collageCommand.run(ctx)
    // })

    this.bot.on('message', async (ctx) => {
      if (!((ctx.message?.text?.startsWith('/')) ?? false)) return
      const chatTittle = (ctx.chat.type === 'private') ? 'Private' : ctx.chat.title ?? 'Unknown'
      this.advConsole.log(`MelodyScout_Bot - New command not handled:\nFrom: (${ctx.message?.from?.id ?? 'No ID'}) ${ctx.message?.from?.first_name ?? 'No name'} ${ctx.message?.from?.last_name ?? ''} - ${ctx.message?.from.username ?? 'No username'}\nIn: (${ctx.chat?.id}) ${chatTittle} - ${ctx.chat.type}\nCommand: ${ctx.message?.text ?? ''}`)
    })

    this.bot.callbackQuery(new RegExp(`^TP${config.melodyScout.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.trackpreviewCallback.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TL${config.melodyScout.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.tracklyricsCallback.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TTL${config.melodyScout.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.translatedtracklyricsCallback.run(ctx)
    })

    this.bot.callbackQuery('PLAYINGNOW', async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.playingnowCallback.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TLE${config.melodyScout.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.tracklyricsexplanationCallback.run(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TD${config.melodyScout.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void this.botFunctions.maintenanceinformCallback.run(ctx)
        return
      }
      void this.botFunctions.trackDownloadCallback.run(ctx)
    })

    this.bot.on('callback_query', async (ctx) => {
      const chatTittle = (ctx.chat?.type === 'private') ? 'Private' : ctx.chat?.title ?? 'Unknown'
      this.advConsole.log(`MelodyScout_Bot - New callback_query not handled:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nIn: (${ctx.chat?.id ?? 'No ID'}) ${chatTittle} - ${ctx.chat?.type ?? 'No type'}\nData: ${ctx.callbackQuery?.data ?? 'No data'}`)
    })

    this.advConsole.log('MelodyScout_Bot - Listening')
  }
}
