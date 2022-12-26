import { CommandContext, Context, RawApi } from 'grammy'
import { AdvConsole } from './advancedConsole'
import { ParseMode } from 'grammy/out/types'
import { Other } from 'grammy/out/core/api'

export class CtxFunctions {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

  async ctxReply (ctx: CommandContext<Context>, message: string, parseMode?: ParseMode, disableWebPagePreview?: boolean): Promise<void> {
    if (message.length > 4096) {
      const errorMsg = 'Ocorreu um erro ao enviar a mensagem, pois ela ultrapassou o limite de 4096 caracteres. Fique tranquilo pois o erro já foi reportado para o desenvolvedor do bot.'
      this.advConsole.error('MelodyScout_Bot - Error: Message length is greater than 4096 characters.')
      await ctx.reply(errorMsg).catch((err) => {
        this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
      })
      return
    }
    await ctx.reply(message, { parse_mode: parseMode !== undefined ? parseMode : 'HTML', disable_web_page_preview: disableWebPagePreview !== undefined ? disableWebPagePreview : false }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
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
