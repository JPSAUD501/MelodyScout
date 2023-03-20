import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'

export class ForgetmeCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msPrismaDbApi: MsPrismaDbApi

  constructor (ctxFunctions: CtxFunctions, msPrismaDbApi: MsPrismaDbApi) {
    this.ctxFunctions = ctxFunctions
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
    await this.ctxFunctions.reply(ctx, 'Ok! Deixa eu verificar alguns dados...')
    const checkIfExistsTgUserDBResponse = await this.msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
    if (!checkIfExistsTgUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    if (!checkIfExistsTgUserDBResponse.exists) {
      void this.ctxFunctions.reply(ctx, 'Parece que você já não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
      return
    }
    const telegramUserDBResponse = await this.msPrismaDbApi.get.telegramUser(telegramUserId)
    if (!telegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    if (telegramUserDBResponse.lastfmUser === null) {
      void this.ctxFunctions.reply(ctx, 'Você já não tem seu usuário do Last.fm registrado, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
      return
    }
    const updatedTelegramUserDBResponse = await this.msPrismaDbApi.update.telegramUser(telegramUserId, null)
    if (!updatedTelegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui esquecer o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    await this.ctxFunctions.reply(ctx, 'Pronto! Eu esqueci o seu nome de usuário do Last.fm!')
  }
}
