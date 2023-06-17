import { CommandContext, Context } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'
import { getHelpText } from '../../textFabric/help'

export async function runHelpCommand (ctx: CommandContext<Context>): Promise<void> {
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    return
  }
  await ctxReply(ctx, getHelpText())
}
