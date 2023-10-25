import { type CommandContext, type Context } from 'grammy'
import { ctxEditMessage, ctxReply } from '../../../functions/grammyFunctions'
import { getBriefText } from '../../textFabric/brief'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lastfmConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getUserFilteredTopTracks } from '../../../functions/getUserFilteredTopTracks'
import { type TracksTotalPlaytime, getTracksTotalPlaytime } from '../../../functions/getTracksTotalPlaytime'

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
  const getUserTotalPlaytime = async (): Promise<TracksTotalPlaytime> => {
    const userAllTopTracks = await getUserFilteredTopTracks(lastfmUser, undefined, undefined)
    const userTotalPlaytime = await getTracksTotalPlaytime(userAllTopTracks.data)
    return userTotalPlaytime
  }
  const userTotalPlaytimeRequest = getUserTotalPlaytime()
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
  const defaultUserTotalPlaytime: TracksTotalPlaytime = {
    status: 'loading'
  }
  const response = await ctxReply(ctx, undefined, getBriefText(ctxLang, userInfo.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data, defaultUserTotalPlaytime))
  if (response === undefined) return
  const userTotalPlaytime = await userTotalPlaytimeRequest
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getBriefText(ctxLang, userInfo.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data, userTotalPlaytime))
}
