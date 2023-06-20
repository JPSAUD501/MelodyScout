import botConfig from './config'
import { Bot, CallbackQueryContext, CommandContext, Context } from 'grammy'
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
import { runPlayingnowCallback } from './botFunctions/callbacks/playingnow'
import { runTrackAudioDownloadCallback } from './botFunctions/callbacks/trackaudiodownload'
import { runTrackDownloadCallback } from './botFunctions/callbacks/trackdonwload'
import { runTracklyricsCallback } from './botFunctions/callbacks/tracklyrics'
import { runTracklyricsexplanationCallback } from './botFunctions/callbacks/tracklyricsexplanation'
import { runTrackpreviewCallback } from './botFunctions/callbacks/trackpreview'
import { runTranslatedtracklyricsCallback } from './botFunctions/callbacks/translatedtracklyrics'
import { MsMusicApi } from '../api/msMusicApi/base'
import { ctxReply } from '../function/grammyFunctions'
import { MsPrismaDbApi } from '../api/msPrismaDbApi/base'

export class MelodyScoutBot {
  private readonly msMusicApi: MsMusicApi
  private readonly msPrismaDbApi: MsPrismaDbApi
  private readonly bot: Bot
  private maintenanceMode = false

  constructor () {
    this.msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
    this.msPrismaDbApi = new MsPrismaDbApi()
    this.bot = new Bot(botConfig.telegram.token)

    console.log('MelodyScout_Bot - Loaded')
  }

  async start (): Promise<void> {
    await this.msMusicApi.start()

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

  hear (): void {
    this.bot.command(['maintenance'], async (ctx) => {
      this.logNewCommand(ctx)
      const maintenanceCommandResponse = await runMaintenanceCommand(ctx)
      if (!maintenanceCommandResponse.success) return
      this.maintenanceMode = maintenanceCommandResponse.maintenanceMode
    })

    this.bot.command(['start'], async (ctx) => {
      this.logNewCommand(ctx)
      await runStartCommand(ctx)
    })

    this.bot.command(['help'], async (ctx) => {
      this.logNewCommand(ctx)
      await runHelpCommand(ctx)
    })

    this.bot.command(['contact'], async (ctx) => {
      this.logNewCommand(ctx)
      await runContactCommand(ctx)
    })

    this.bot.command(['myuser', 'setuser', 'reg', 'register'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runMyuserCommand(this.msPrismaDbApi, ctx)
    })

    this.bot.command(['forgetme'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runForgetmeCommand(this.msPrismaDbApi, ctx)
    })

    this.bot.command(['brief'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runBriefCommand(this.msPrismaDbApi, ctx)
    })

    this.bot.command(['playingnow', 'pn', 'listeningnow'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runPlayingnowCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
      if (Math.random() < 0.20) {
        await ctxReply(ctx, 'Ei! Você está gostando do MelodyScout? Estamos realizando uma pesquisa para melhorar o bot, você poderia responder? Seremos muito gratos!\nhttps://forms.gle/WCxZUdW8owwbxxcw8')
      }
    })

    this.bot.command(['history'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runHistoryCommand(this.msPrismaDbApi, ctx)
    })

    this.bot.command(['pin'], async (ctx) => {
      this.logNewCommand(ctx)
      await runPinCommand(ctx)
    })

    this.bot.command(['pntrack'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runPntrackCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.bot.command(['pnalbum'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runPnalbumCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.bot.command(['pnartist'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runPnartistCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.bot.command(['allusers'], async (ctx) => {
      this.logNewCommand(ctx)
      await runAllusersCommand(this.msPrismaDbApi, ctx)
    })

    this.bot.command(['mashup'], async (ctx) => {
      this.logNewCommand(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCommand(ctx)
        return
      }
      await runMashupCommand(this.msMusicApi, this.msPrismaDbApi, ctx)
    })

    this.bot.on('message', async (ctx) => {
      if (!((ctx.message?.text?.startsWith('/')) ?? false)) return
      const chatTittle = (ctx.chat.type === 'private') ? 'Private' : ctx.chat.title ?? 'Unknown'
      advLog(`MelodyScout_Bot - New command not handled:\nFrom: (${ctx.message?.from?.id ?? 'No ID'}) ${ctx.message?.from?.first_name ?? 'No name'} ${ctx.message?.from?.last_name ?? ''} - ${ctx.message?.from.username ?? 'No username'}\nIn: (${ctx.chat?.id}) ${chatTittle} - ${ctx.chat.type}\nCommand: ${ctx.message?.text ?? ''}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
    })

    this.bot.callbackQuery(new RegExp(`^TP${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runTrackpreviewCallback(this.msMusicApi, ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TL${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runTracklyricsCallback(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TTL${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runTranslatedtracklyricsCallback(ctx)
    })

    this.bot.callbackQuery('PLAYINGNOW', async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runPlayingnowCallback(this.msMusicApi, this.msPrismaDbApi, ctx)
      if (Math.random() < 0.20) {
        await ctxReply(ctx, 'Ei! Você está gostando do MelodyScout? Estamos realizando uma pesquisa para melhorar o bot, você poderia responder? Seremos muito gratos!\nhttps://forms.gle/WCxZUdW8owwbxxcw8')
      }
    })

    this.bot.callbackQuery(new RegExp(`^TLE${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runTracklyricsexplanationCallback(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TD${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runTrackDownloadCallback(ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TAD${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runTrackAudioDownloadCallback(this.msMusicApi, ctx)
    })

    this.bot.callbackQuery(new RegExp(`^TVD${melodyScoutConfig.divider}`), async (ctx) => {
      this.logNewCallbackQuery(ctx)
      if (this.maintenanceMode) {
        await runMaintenanceinformCallback(ctx)
        return
      }
      await runTrackVideoDownloadCallback(this.msMusicApi, ctx)
    })

    this.bot.on('callback_query', async (ctx) => {
      const chatTittle = (ctx.chat?.type === 'private') ? 'Private' : ctx.chat?.title ?? 'Unknown'
      advLog(`MelodyScout_Bot - New callback_query not handled:\nFrom: (${ctx.from?.id ?? 'No ID'}) ${ctx.from?.first_name ?? 'No name'} ${ctx.from?.last_name ?? ''} - ${ctx.from?.username ?? 'No username'}\nIn: (${ctx.chat?.id ?? 'No ID'}) ${chatTittle} - ${ctx.chat?.type ?? 'No type'}\nData: ${ctx.callbackQuery?.data ?? 'No data'}\nLang: ${ctx.from?.language_code ?? 'No lang'}`)
    })

    advLog('MelodyScout_Bot - Listening')
  }
}
