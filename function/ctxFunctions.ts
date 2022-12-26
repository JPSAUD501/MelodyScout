import { CommandContext, Context, RawApi } from 'grammy'
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
}
