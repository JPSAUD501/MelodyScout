import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import config from '../../../config'
import { PrismaDB } from '../../../function/prismaDB/base'

export class AllusersCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly prismaDB: PrismaDB

  constructor (ctxFunctions: CtxFunctions, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions
    this.prismaDB = prismaDB
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    // Check if ctx from id is in the admin list
    const ctxFromId = ctx.from?.id
    if (ctxFromId === undefined) {
      await this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!')
      return
    }
    if (!config.melodyScout.admins.includes(ctxFromId.toString())) return
    const allUsers = await this.prismaDB.get.allTelegramUsers()
    if (!allUsers.success) {
      await this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível recuperar os usuários do banco de dados, por favor tente novamente mais tarde!')
      return
    }
    const personsEmojis = ['🧑', '🧔', '🧓', '🧕', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '👨', '👩', '👱', '👴', '👵', '👲', '👳', '👮', '👷', '💂', '🕵', '👼', '🎅', '👸', '🤴', '👰', '🤵']
    const allUsersString = allUsers.telegramUsers.map((user) => {
      return `${personsEmojis[Math.floor(Math.random() * personsEmojis.length)]} - TELEGRAM-ID: <code>${user.telegramUserId}</code> | LASTFM-USER: <code>${user.lastfmUser === null ? 'Não cadastrado' : user.lastfmUser}</code> | LAST-UPDATE: <code>${user.lastUpdate}</code>`
    }).join('\n')
    await this.ctxFunctions.reply(ctx, `<b>[🗃] Lista de usuários do MelodyScout:</b>\n\n${allUsersString}`)
  }
}
