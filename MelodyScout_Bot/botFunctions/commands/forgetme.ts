import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { PrismaDB } from '../../../function/prismaDB/base'

export class ForgetmeCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly prismaDB: PrismaDB

  constructor (ctxFunctions: CtxFunctions, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions
    this.prismaDB = prismaDB
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    const telegramUserId = ctx.from?.id.toString()
    if (telegramUserId === undefined) return await this.ctxFunctions.reply(ctx, 'Estranho! Parece que eu não consegui identificar o seu ID no Telegram! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    await this.ctxFunctions.reply(ctx, 'Ok! Deixa eu verificar alguns dados...')
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(telegramUserId)
    if (!telegramUserDBResponse.success) return await this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    if (telegramUserDBResponse.lastfmUser === null) return await this.ctxFunctions.reply(ctx, 'Parece que você ainda não está registrado! Para registrar um nome de usuário do Last.fm, envie o comando /myuser junto com o seu nome de usuário como no exemplo a seguir: <code>/myuser MelodyScout</code>')
    const updatedTelegramUserDBResponse = await this.prismaDB.update.telegramUser(telegramUserId, null)
    if (!updatedTelegramUserDBResponse.success) return await this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui esquecer o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    await this.ctxFunctions.reply(ctx, 'Pronto! Eu esqueci o seu nome de usuário do Last.fm!')
  }
}