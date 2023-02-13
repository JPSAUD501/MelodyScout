import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { PrismaDB } from '../../../function/prismaDB/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { AdvConsole } from '../../../function/advancedConsole'

export class MyuserCommand {
  private readonly advConsole: AdvConsole
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly prismaDB: PrismaDB

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB) {
    this.advConsole = advConsole
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.prismaDB = prismaDB
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return
    }
    const telegramUserId = ctx.from?.id.toString()
    if (telegramUserId === undefined) {
      void this.ctxFunctions.reply(ctx, 'Estranho! Parece que eu não consegui identificar o seu ID no Telegram! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(telegramUserId)
    if (!telegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui verificar se você já está cadastrado no MelodyScout! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    if (telegramUserDBResponse.lastfmUser !== null) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que você já está cadastrado no MelodyScout! Por favor, utilize o comando /forgetme para que eu esqueça o seu cadastro no MelodyScout e depois utilize o comando /myuser novamente para cadastrar o seu nome de usuário do Last.fm!')
      return
    }
    const message = ((ctx.message?.text?.split(' ')) != null) ? ctx.message?.text?.split(' ') : []
    if (message.length < 2) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que você não me informou o seu nome de usuário do Last.fm! Por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>')
      return
    }
    const username = message[1]
    const userExists = await this.msLastfmApi.checkIfUserExists(username)
    if (!userExists.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui verificar se o seu nome de usuário do Last.fm existe! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    if (!userExists.exists) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que o nome de usuário do Last.fm que você me informou não existe! Por favor, tente novamente informando um nome de usuário do Last.fm válido!')
      return
    }
    const updateTelegramUserDBResponse = await this.prismaDB.update.telegramUser(telegramUserId, username)
    if (!updateTelegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui registrar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    this.advConsole.info(`The user "${telegramUserId}" registered the Last.fm username "${username}" in MelodyScout!`)
    await this.ctxFunctions.reply(ctx, 'Pronto! Seu nome de usuário do Last.fm foi registrado com sucesso! Agradeço imensamente por isso e espero que você aproveite o bot!')
  }
}
