import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { melodyScoutConfig } from '../../../config'

export class AllusersCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msPrismaDbApi: MsPrismaDbApi

  constructor (ctxFunctions: CtxFunctions, msPrismaDbApi: MsPrismaDbApi) {
    this.ctxFunctions = ctxFunctions
    this.msPrismaDbApi = msPrismaDbApi
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      await this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return
    }
    const ctxFromId = ctx.from?.id
    if (ctxFromId === undefined) {
      await this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!')
      return
    }
    if (!melodyScoutConfig.admins.includes(ctxFromId.toString())) return
    const allUsers = await this.msPrismaDbApi.get.allTelegramUsers()
    if (!allUsers.success) {
      await this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível recuperar os usuários do banco de dados, por favor tente novamente mais tarde!')
      return
    }
    const personsEmojis = ['🧑', '🧔', '🧓', '🧕', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '👨', '👩', '👱', '👴', '👵', '👲', '👳', '👮', '👷', '💂', '🕵', '👼', '🎅', '👸', '🤴', '👰', '🤵']
    const allUsersString = allUsers.telegramUsers.map((user) => {
      return `<b>[${personsEmojis[parseInt(user.telegramUserId) % personsEmojis.length]}] <code>${user.lastfmUser === null ? 'Descadastrado' : user.lastfmUser}</code>:</b>\n- TelegramID: <code>${user.telegramUserId}</code>\n- LastUpdate: <code>${user.lastUpdate}</code>\n`
    }).join('\n')
    await this.ctxFunctions.reply(ctx, `<b>[🗃] Lista de usuários:</b>\n- Total de usuários: <code>${allUsers.telegramUsers.length}</code>\n\n${allUsersString}`)
  }
}
