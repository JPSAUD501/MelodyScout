import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { advInfo } from '../../../functions/advancedConsole'
import { lastfmConfig } from '../../../config'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lang } from '../../../translations/base'
import { getMyuserText } from '../../textFabric/myuser'

export async function runMyuserCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return
  }
  const telegramUserId = ctx.from?.id.toString()
  if (telegramUserId === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }))
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'firstTimeRegisterWelcomeMessage', value: 'Verifiquei que é seu primeiro cadastro no MelodyScout! Que bom que você decidiu me conhecer!' }))
    const createTelegramUserDBResponse = await msPrismaDbApi.create.telegramUser(telegramUserId)
    if (!createTelegramUserDBResponse.success) {
      void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
      return
    }
    advInfo(`New user "${telegramUserId}" registered!`)
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(telegramUserId)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const message = ((ctx.message?.text?.split(' ')) != null) ? ctx.message?.text?.split(' ') : []
  if (message.length < 2 && telegramUserDBResponse.lastfmUser === null) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'myuserMissingLastfmUserErrorMessage', value: 'Ops! Parece que você não me informou o seu nome de usuário do Last.fm! Por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>' }))
    return
  }
  if (message.length < 2 && telegramUserDBResponse.lastfmUser !== null) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'myuserAlreadyRegisteredLastfmUserInformMessage', value: 'Vi aqui que você já tem um nome de usuário do Last.fm cadastrado! Ele é "<code>{{lastfmUser}}</code>"! Se você quiser atualizar ele, por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>' }, { lastfmUser: telegramUserDBResponse.lastfmUser }))
    return
  }
  const username = message[1]
  if (username === telegramUserDBResponse.lastfmUser) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'myuserAlreadyRegisteredLastfmUserErrorMessage', value: 'Ops! Parece que você já tem o nome de usuário do Last.fm "<code>{{lastfmUser}}</code>" cadastrado! Se você quiser atualizar ele, por favor, tente novamente informando o seu novo nome de usuário do Last.fm!' }, { lastfmUser: username }))
    return
  }
  if (telegramUserDBResponse.lastfmUser !== null) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'myuserAlreadyRegisteredLastfmUserChangingInformMessage', value: 'Verifiquei que você já tem um nome de usuário do Last.fm cadastrado! Vou atualizar ele para você!' }))
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userExists = await msLastfmApi.checkIfUserExists(username)
  if (!userExists.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'myuserLastfmUserCheckErrorMessage', value: 'Ops! Eu não consegui verificar se o seu nome de usuário do Last.fm existe! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' }))
    return
  }
  if (!userExists.exists) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'myuserLastfmUserNotExistsInLastfmErrorMessage', value: 'Ops! Parece que o nome de usuário do Last.fm que você me informou não existe! Por favor, tente novamente informando um nome de usuário do Last.fm válido!' }))
    return
  }
  const updateTelegramUserDBResponse = await msPrismaDbApi.update.telegramUser(telegramUserId, username)
  if (!updateTelegramUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'myuserLastfmUserDatabaseUpdateErrorMessage', value: 'Ops! Eu não consegui registrar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' }))
    return
  }
  advInfo(`The user "${telegramUserId}" registered the Last.fm username "${username}" in MelodyScout!`)
  await ctxReply(ctx, undefined, getMyuserText(ctxLang))
}
