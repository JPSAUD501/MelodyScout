import { CommandContext, Context } from 'grammy'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { ctxReply } from '../../../function/grammyFunctions'
import { lang } from '../../../translations/base'

export async function runForgetmeCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
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
  await ctxReply(ctx, 'Ok! Deixa eu verificar alguns dados...')
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, 'Parece que você já não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(telegramUserId)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    return
  }
  if (telegramUserDBResponse.lastfmUser === null) {
    void ctxReply(ctx, 'Você já não tem seu usuário do Last.fm registrado, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    return
  }
  const updatedTelegramUserDBResponse = await msPrismaDbApi.update.telegramUser(telegramUserId, null)
  if (!updatedTelegramUserDBResponse.success) {
    void ctxReply(ctx, 'Ops! Parece que eu não consegui esquecer o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    return
  }
  await ctxReply(ctx, 'Pronto! Eu esqueci o seu nome de usuário do Last.fm!')
}
