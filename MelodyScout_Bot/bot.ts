import botConfig from './config'
import { Bot, CallbackQueryContext, CommandContext, Composer, Context } from 'grammy'
import { melodyScoutConfig, spotifyConfig } from '../config'
import { advError, advLog } from '../function/advancedConsole'
import { runMaintenanceinformCallback } from './botFunctions/callbacks/maintenanceinform'
import { runTrackVideoDownloadCallback } from './botFunctions/callbacks/trackvideodownload'
import { runContactCommand } from './botFunctions/commands/contact'
import { runForgetmeCommand } from './botFunctions/commands/forgetme'
import { runMaintenanceCommand } from './botFunctions/commands/maintenance'
import { runMaintenanceinformCommand } from './botFunctions/commands/maintenanceinform'
import { runMyuserCommand } from './botFunctions/commands/myuser'
import { runStartCommand } from './botFunctions/commands/start'
import { runHelpCommand } from './botFunctions/commands/help'
import { runAllusersCommand } from './botFunctions/commands/allusers'
import { runBriefCommand } from './botFunctions/commands/brief'
import { runHistoryCommand } from './botFunctions/commands/history'
import { runMashupCommand } from './botFunctions/commands/mashup'
import { runPinCommand } from './botFunctions/commands/pin'
import { runPlayingnowCommand } from './botFunctions/commands/playingnow'
import { runPnalbumCommand } from './botFunctions/commands/pnalbum'
import { runPnartistCommand } from './botFunctions/commands/pnartist'
import { runPntrackCommand } from './botFunctions/commands/pntrack'
import { runTrackAudioDownloadCallback } from './botFunctions/callbacks/trackaudiodownload'
import { runTrackDownloadCallback } from './botFunctions/callbacks/trackdownload'
import { runTracklyricsCallback } from './botFunctions/callbacks/tracklyrics'
import { runTracklyricsexplanationCallback } from './botFunctions/callbacks/tracklyricsexplanation'
import { runTrackpreviewCallback } from './botFunctions/callbacks/trackpreview'
import { runTranslatedtracklyricsCallback } from './botFunctions/callbacks/translatedtracklyrics'
import { MsMusicApi } from '../api/msMusicApi/base'
import { MsPrismaDbApi } from '../api/msPrismaDbApi/base'
import { runPlayingnowCallback } from './botFunctions/callbacks/playingnow'

export class MelodyScoutBot {
  private readonly msMusicApi: MsMusicApi
  private readonly msPrismaDbApi: MsPrismaDbApi
  private readonly bot: Bot
  private readonly composer: Composer<Context>
  private maintenanceMode = false

  constructor () {
    this.msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
    this.msPrismaDbApi = new MsPrismaDbApi()
    this.bot = new Bot(botConfig.telegram.token)
    this.composer = new Composer()

    console.log('MelodyScout_Bot - Loaded')
  }

  async start (): Promise<void> {
    await this.msMusicApi.start()

    this.hear()

    this.bot.use(this.composer.middleware())

    this.bot.start().catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
    })

    this.bot.catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
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
      { command: 'mashup', description: 'Create a mashup of your 2 last listened tracks' },
      { command: 'pin', description: 'Pin a shortcut to the /playingnow command' },
      { command: 'pntrack', description: 'Show information about the currently playing track' },
      { command: 'pnalbum', description: 'Show information about the album of the currently playing track' },
      { command: 'pnartist', description: 'Show information about the artist of the currently playing track' }
    ]).catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
    })

    advLog('MelodyScout_Bot - Started')
  }

  async getBotInfo (): Promise<void> {
    await this.bot.api.getMe().catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  logNewCommand (ctx: CommandContext<Context>): void {
    if (!((ctx.message?.text?.startsWith('/')) ?? false)) return
    const chatTittle = (ctx.chat.type === 'private') ? 'Private' : ctx.chat.title ?? 'Unknown'
    advLog(`MelodyScout_Bot - New command:\nFrom: (${ctx.message?.from?.id ?? 'No ID'}) ${ctx.message?.from?.first_name ?? 'No name'} ${ctx.message?.from?.last_name ?? ''} - ${ctx.message?.from.username ?? 'No username'}\nIn: (${ctx.chat?.id}) ${chatTittle} - ${ctx.chat.type}\nCommand: ${ctx.message?.text ?? ''}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
  }

  logNewCallbackQuery (ctx: CallbackQueryContext<Context>): void {
    const chatTittle = (ctx.chat?.type === 'private') ? 'Private' : ctx.chat?.title ?? 'Unknown'
    advLog(`MelodyScout_Bot - New callback_query:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nIn: (${ctx.chat?.id ?? 'No ID'}) ${chatTittle} - ${ctx.chat?.type ?? 'No type'}\nData: ${ctx.callbackQuery?.data ?? 'No data'}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
  }

  private hear (): void {
    this.composer.command(['maintenance'], async (ctx) => {
      this.logNewCommand(ctx)
      const maintenanceCommandResponse = await runMaintenanceCommand(ctx)
      if (!maintenanceCommandResponse.success) return
      this.maintenanceMode = maintenanceCommandResponse.maintenanceMode
    })

    this.composer.command(['start'], async (ctx) => {
      this.logNewCommand(ctx)
      void runStartCommand(ctx)
    })

    this.composer.command(['help'], async (ctx) => {
      this.logNewCommand(ctx)
      void runHelpCommand(ctx)
    })

    this.composer.command(['contact'], async (ctx) => {
      this.logNewCommand(ctx)
      void runContactCommand(ctx)
    })

    this.composer.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runMyuserCommand(this.msPrismaDbApi, ctx)
    })

    this.composer.command(['forgetme'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runForgetmeCommand(this.msPrismaDbApi, ctx)
    })

    this.composer.command(['brief'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runBriefCommand(this.msPrismaDbApi, ctx)
    })

    this.composer.command(['playingnow', 'pn', 'listeningnow'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runPlayingnowCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.composer.command(['history'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runHistoryCommand(this.msPrismaDbApi, ctx)
    })

    this.composer.command(['pin'], async (ctx) => {
      this.logNewCommand(ctx)
      void runPinCommand(ctx)
    })

    this.composer.command(['pntrack'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runPntrackCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.composer.command(['pnalbum'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runPnalbumCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.composer.command(['pnartist'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runPnartistCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.composer.command(['allusers'], async (ctx) => {
      this.logNewCommand(ctx)
      void runAllusersCommand(this.msPrismaDbApi, ctx)
    })

    this.composer.command(['mashup'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCommand(ctx)
        return
      }
      void runMashupCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.composer.on('message', async (ctx) => {
      if (!((ctx.message?.text?.startsWith('/')) ?? false)) return
      const chatTittle = (ctx.chat.type === 'private') ? 'Private' : ctx.chat.title ?? 'Unknown'
      advLog(`MelodyScout_Bot - New command not handled:\nFrom: (${ctx.message?.from?.id ?? 'No ID'}) ${ctx.message?.from?.first_name ?? 'No name'} ${ctx.message?.from?.last_name ?? ''} - ${ctx.message?.from.username ?? 'No username'}\nIn: (${ctx.chat?.id}) ${chatTittle} - ${ctx.chat.type}\nCommand: ${ctx.message?.text ?? ''}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
    })

    this.composer.callbackQuery(new RegExp(`^TP${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runTrackpreviewCallback(this.msMusicApi, ctx)
    })

    this.composer.callbackQuery(new RegExp(`^TL${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runTracklyricsCallback(ctx)
    })

    this.composer.callbackQuery(new RegExp(`^TTL${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runTranslatedtracklyricsCallback(ctx)
    })

    this.composer.callbackQuery('PLAYINGNOW', async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runPlayingnowCallback(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.composer.callbackQuery(new RegExp(`^TLE${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runTracklyricsexplanationCallback(ctx)
    })

    this.composer.callbackQuery(new RegExp(`^TD${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runTrackDownloadCallback(ctx)
    })

    this.composer.callbackQuery(new RegExp(`^TAD${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runTrackAudioDownloadCallback(this.msMusicApi, ctx)
    })

    this.composer.callbackQuery(new RegExp(`^TVD${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        void runMaintenanceinformCallback(ctx)
        return
      }
      void runTrackVideoDownloadCallback(this.msMusicApi, ctx)
    })

    this.composer.on('callback_query', async (ctx) => {
      const chatTittle = (ctx.chat?.type === 'private') ? 'Private' : ctx.chat?.title ?? 'Unknown'
      advLog(`MelodyScout_Bot - New callback_query not handled:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nIn: (${ctx.chat?.id ?? 'No ID'}) ${chatTittle} - ${ctx.chat?.type ?? 'No type'}\nData: ${ctx.callbackQuery?.data ?? 'No data'}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
    })

    advLog('MelodyScout_Bot - Listening')
  }
}
