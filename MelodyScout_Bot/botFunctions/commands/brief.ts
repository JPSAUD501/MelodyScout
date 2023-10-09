import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { getBriefText } from '../../textFabric/brief'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lastfmConfig, melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'

export async function runBriefCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, 'unableToGetUserIdErrorMessage'))
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmUserNotRegistered'))
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmUserNoMoreRegisteredError'))
    return
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 5, 1)
  const userTopAlbumsRequest = msLastfmApi.user.getTopAlbums(lastfmUser, 5)
  const userTopArtistsRequest = msLastfmApi.user.getTopArtists(lastfmUser, 5)
  const [userInfo, userTopTracks, userTopAlbums, userTopArtists] = await Promise.all([userInfoRequest, userTopTracksRequest, userTopAlbumsRequest, userTopArtistsRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }))
    return
  }
  if (!userTopTracks.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'getTopTracksErrorMessage'))
    return
  }
  if (!userTopAlbums.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'getTopAlbumsErrorMessage'))
    return
  }
  if (!userTopArtists.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'getTopArtistsErrorMessage'))
    return
  }
  const tfFinalText = getBriefText(ctxLang, userInfo.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data)
  await ctxReply(ctx, undefined, tfFinalText)
  await ctxReply(ctx, { chatId: melodyScoutConfig.blogChannelChatId }, tfFinalText)
}
