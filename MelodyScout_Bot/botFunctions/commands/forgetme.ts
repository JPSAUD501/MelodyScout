import { type CommandContext, type Context } from 'grammy'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { ctxReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { getForgetmeText } from '../../textFabric/forgetme'

export async function runForgetmeCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
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
  await ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserForgetmeCheckingDataMessage', value: 'Ok! Deixa eu verificar alguns dados…' }))
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserNotRegistered', value: 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }))
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(telegramUserId)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetLastfmUserInDbErrorMessage', value: 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' }))
    return
  }
  if (telegramUserDBResponse.lastfmUser === null) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserAlreadyNotRegisteredErrorMessage', value: 'Você já não tem seu usuário do Last.fm registrado, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }))
    return
  }
  const updatedTelegramUserDBResponse = await msPrismaDbApi.update.telegramUser(telegramUserId, null)
  if (!updatedTelegramUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToForgetLastfmUserInDbErrorMessage', value: 'Ops! Parece que eu não consegui esquecer o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' }))
    return
  }
  await ctxReply(ctx, undefined, getForgetmeText(ctxLang))
}
