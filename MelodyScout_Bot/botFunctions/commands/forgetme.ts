import { CommandContext, Context } from 'grammy'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { ctxReply } from '../../../function/grammyFunctions'
import { lang } from '../../../translations/base'
import { getForgetmeText } from '../../textFabric/forgetme'

export async function runForgetmeCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const telegramUserId = ctx.from?.id.toString()
  if (telegramUserId === undefined) {
    await ctxReply(ctx, lang(ctxLang, 'unableToGetUserIdErrorMessage'))
    return
  }
  await ctxReply(ctx, lang(ctxLang, 'lastfmUserForgetmeCheckingDataMessage'))
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserNotRegistered'))
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(telegramUserId)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetLastfmUserInDbErrorMessage'))
    return
  }
  if (telegramUserDBResponse.lastfmUser === null) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserAlreadyNotRegisteredErrorMessage'))
    return
  }
  const updatedTelegramUserDBResponse = await msPrismaDbApi.update.telegramUser(telegramUserId, null)
  if (!updatedTelegramUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToForgetLastfmUserInDbErrorMessage'))
    return
  }
  await ctxReply(ctx, getForgetmeText(ctxLang))
}
