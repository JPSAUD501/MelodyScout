import { CallbackQueryContext, CommandContext, Context, InputFile, RawApi } from 'grammy'
import { AdvConsole } from './advancedConsole'
import { Other } from 'grammy/out/core/api'

export class CtxFunctions {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

  async reply (ctx: CommandContext<Context> | CallbackQueryContext<Context>, message: string, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    await ctx.api.sendMessage(ctx.chat.id, message, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async answerCallbackQuery (ctx: CallbackQueryContext<Context>, message?: string): Promise<void> {
    await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
      text: message
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async replyWithAudio (ctx: CommandContext<Context> | CallbackQueryContext<Context>, audio: string | InputFile, options?: Other<RawApi, 'sendAudio', 'audio' | 'chat_id'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    const loadingMessage = await ctx.reply('<b>[🎵] Enviando audio por favor aguarde!</b>', {
      parse_mode: 'HTML'
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (loadingMessage === undefined) return this.advConsole.error('MelodyScout_Bot - Error: loadingMessage is undefined')
    await ctx.api.sendAudio(ctx.chat.id, audio, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async replyWithVideo (ctx: CommandContext<Context> | CallbackQueryContext<Context>, video: string | InputFile, options?: Other<RawApi, 'sendVideo', 'chat_id' | 'video'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    const loadingMessage = await ctx.reply('<b>[🎥] Enviando vídeo por favor aguarde!</b>', {
      parse_mode: 'HTML'
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (loadingMessage === undefined) return this.advConsole.error('MelodyScout_Bot - Error: loadingMessage is undefined')
    await ctx.api.sendVideo(ctx.chat.id, video, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }
}
