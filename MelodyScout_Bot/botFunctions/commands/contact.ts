import { CommandContext, Context } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'

export class ContactCommand {
  async run (ctx: CommandContext<Context>): Promise<void> {
    await ctxReply(ctx, 'Para entrar em contato com o desenvolvedor do bot, envie uma mensagem para o @jpsaud!')
  }
}
