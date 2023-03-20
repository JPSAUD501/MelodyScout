import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { AdvConsole } from '../../../function/advancedConsole'

export class MyuserCommand {
  private readonly advConsole: AdvConsole
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly msPrismaDbApi: MsPrismaDbApi

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi) {
    this.advConsole = advConsole
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.msPrismaDbApi = msPrismaDbApi
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
    const checkIfExistsTgUserDBResponse = await this.msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
    if (!checkIfExistsTgUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    if (!checkIfExistsTgUserDBResponse.exists) {
      void this.ctxFunctions.reply(ctx, 'Verifiquei que é seu primeiro cadastro no MelodyScout! Que bom que você decidiu me conhecer!')
      const createTelegramUserDBResponse = await this.msPrismaDbApi.create.telegramUser(telegramUserId)
      if (!createTelegramUserDBResponse.success) {
        void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui salvar suas informações no banco de dados! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
        return
      }
      this.advConsole.info(`New user "${telegramUserId}" registered!`)
    }
    const telegramUserDBResponse = await this.msPrismaDbApi.get.telegramUser(telegramUserId)
    if (!telegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui resgatar suas informações do banco de dados! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    const message = ((ctx.message?.text?.split(' ')) != null) ? ctx.message?.text?.split(' ') : []
    if (message.length < 2 && telegramUserDBResponse.lastfmUser === null) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que você não me informou o seu nome de usuário do Last.fm! Por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>')
      return
    }
    if (message.length < 2 && telegramUserDBResponse.lastfmUser !== null) {
      void this.ctxFunctions.reply(ctx, `Vi aqui que você já tem um nome de usuário do Last.fm cadastrado! Ele é "<code>${telegramUserDBResponse.lastfmUser}</code>"! Se você quiser atualizar ele, por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>`)
      return
    }
    const username = message[1]
    if (username === telegramUserDBResponse.lastfmUser) {
      void this.ctxFunctions.reply(ctx, `Ops! Parece que você já tem o nome de usuário do Last.fm "<code>${username}</code>" cadastrado! Se você quiser atualizar ele, por favor, tente novamente informando o seu novo nome de usuário do Last.fm!`)
      return
    }
    if (telegramUserDBResponse.lastfmUser !== null) {
      void this.ctxFunctions.reply(ctx, 'Verifiquei que você já tem um nome de usuário do Last.fm cadastrado! Vou atualizar ele para você!')
    }
    const userExists = await this.msLastfmApi.checkIfUserExists(username)
    if (!userExists.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Eu não consegui verificar se o seu nome de usuário do Last.fm existe! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    if (!userExists.exists) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que o nome de usuário do Last.fm que você me informou não existe! Por favor, tente novamente informando um nome de usuário do Last.fm válido!')
      return
    }
    const updateTelegramUserDBResponse = await this.msPrismaDbApi.update.telegramUser(telegramUserId, username)
    if (!updateTelegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui registrar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    this.advConsole.info(`The user "${telegramUserId}" registered the Last.fm username "${username}" in MelodyScout!`)
    await this.ctxFunctions.reply(ctx, 'Pronto! Seu nome de usuário do Last.fm foi registrado com sucesso! Agradeço imensamente por isso e espero que você aproveite o bot!')
  }
}
