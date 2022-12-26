import { CallbackQueryContext, CommandContext, Context, RawApi } from 'grammy'
import { AdvConsole } from './advancedConsole'
import { Other } from 'grammy/out/core/api'

export class CtxFunctions {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

  async reply (ctx: CommandContext<Context>, message: string, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<void> {
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

  async replyWithAudio (ctx: CommandContext<Context> | CallbackQueryContext<Context>, audio: string, options?: Other<RawApi, 'sendAudio', 'audio' | 'chat_id'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    await ctx.api.sendAudio(ctx.chat.id, audio, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }
}
