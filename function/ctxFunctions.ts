import { CommandContext, Context } from 'grammy'
import { AdvConsole } from './advancedConsole'
import { ParseMode } from 'grammy/out/types'

export class CtxFunctions {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

  async ctxReply (ctx: CommandContext<Context>, message: string, parseMode?: ParseMode, disableWebPagePreview?: boolean): Promise<void> {
    await ctx.reply(message, { parse_mode: parseMode !== undefined ? parseMode : 'HTML', disable_web_page_preview: disableWebPagePreview !== undefined ? disableWebPagePreview : false }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }
}
