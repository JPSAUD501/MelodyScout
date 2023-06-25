import { CommandContext, Context } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { advInfo } from '../../../function/advancedConsole'
import { lastfmConfig } from '../../../config'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lang } from '../../../translations/base'

export async function runMyuserCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const telegramUserId = ctx.from?.id.toString()
  if (telegramUserId === undefined) {
    void ctxReply(ctx, 'Estranho! Parece que eu não consegui identificar o seu ID no Telegram! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, 'Verifiquei que é seu primeiro cadastro no MelodyScout! Que bom que você decidiu me conhecer!')
    const createTelegramUserDBResponse = await msPrismaDbApi.create.telegramUser(telegramUserId)
    if (!createTelegramUserDBResponse.success) {
      void ctxReply(ctx, 'Ops! Parece que eu não consegui salvar suas informações no banco de dados! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
      return
    }
    advInfo(`New user "${telegramUserId}" registered!`)
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(telegramUserId)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, 'Ops! Parece que eu não consegui resgatar suas informações do banco de dados! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    return
  }
  const message = ((ctx.message?.text?.split(' ')) != null) ? ctx.message?.text?.split(' ') : []
  if (message.length < 2 && telegramUserDBResponse.lastfmUser === null) {
    void ctxReply(ctx, 'Ops! Parece que você não me informou o seu nome de usuário do Last.fm! Por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>')
    return
  }
  if (message.length < 2 && telegramUserDBResponse.lastfmUser !== null) {
    void ctxReply(ctx, `Vi aqui que você já tem um nome de usuário do Last.fm cadastrado! Ele é "<code>${telegramUserDBResponse.lastfmUser}</code>"! Se você quiser atualizar ele, por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>`)
    return
  }
  const username = message[1]
  if (username === telegramUserDBResponse.lastfmUser) {
    void ctxReply(ctx, `Ops! Parece que você já tem o nome de usuário do Last.fm "<code>${username}</code>" cadastrado! Se você quiser atualizar ele, por favor, tente novamente informando o seu novo nome de usuário do Last.fm!`)
    return
  }
  if (telegramUserDBResponse.lastfmUser !== null) {
    void ctxReply(ctx, 'Verifiquei que você já tem um nome de usuário do Last.fm cadastrado! Vou atualizar ele para você!')
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userExists = await msLastfmApi.checkIfUserExists(username)
  if (!userExists.success) {
    void ctxReply(ctx, 'Ops! Eu não consegui verificar se o seu nome de usuário do Last.fm existe! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    return
  }
  if (!userExists.exists) {
    void ctxReply(ctx, 'Ops! Parece que o nome de usuário do Last.fm que você me informou não existe! Por favor, tente novamente informando um nome de usuário do Last.fm válido!')
    return
  }
  const updateTelegramUserDBResponse = await msPrismaDbApi.update.telegramUser(telegramUserId, username)
  if (!updateTelegramUserDBResponse.success) {
    void ctxReply(ctx, 'Ops! Parece que eu não consegui registrar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    return
  }
  advInfo(`The user "${telegramUserId}" registered the Last.fm username "${username}" in MelodyScout!`)
  await ctxReply(ctx, 'Pronto! Seu nome de usuário do Last.fm foi registrado com sucesso! Agradeço imensamente por isso e espero que você aproveite o bot!')
}
