import { type CallbackQueryContext, type CommandContext, type Context, InlineKeyboard } from 'grammy'
import { getPnartistText } from '../../textFabric/pnartist'
import { ctxEditMessage, ctxReply } from '../../../functions/grammyFunctions'
import { lastfmConfig, spotifyConfig } from '../../../config'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { lang } from '../../../translations/base'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { type TracksTotalPlaytime, getTracksTotalPlaytime } from '../../../functions/getTracksTotalPlaytime'
import { getUserFilteredTopTracks, type UserFilteredTopTracks } from '../../../functions/getUserFilteredTopTracks'

export async function runPnartistCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context> | CallbackQueryContext<Context>): Promise<void> {
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
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1, 1)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }))
    return
  }
  if (!userRecentTracks.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'unableToGetUserRecentTracksHistory'))
    return
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'noRecentTracksError'))
    return
  }
  const mainTrack = {
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const userArtistTopTracksRequest = getUserFilteredTopTracks(lastfmUser, mainTrack.artistName, undefined)
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const spotifyArtistInfoRequest = msMusicApi.getSpotifyArtistInfo(mainTrack.artistName)
  const deezerArtistInfoRequest = new MsDeezerApi().search.artist(mainTrack.artistName, 1)
  const [artistInfo, spotifyArtistInfo, deezerArtistInfo] = await Promise.all([artistInfoRequest, spotifyArtistInfoRequest, deezerArtistInfoRequest])
  if (!artistInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmArtistDataNotFoundedError'))
    return
  }
  if (!spotifyArtistInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'spotifyArtistDataNotFoundedError'))
    return
  }
  const defaultUserArtistTopTracks: UserFilteredTopTracks = {
    status: 'loading',
    data: []
  }
  const defaultUserArtistTotalPlaytime: TracksTotalPlaytime = {
    status: 'loading'
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyArtistInfo.data[0].external_urls.spotify)
  if (
    deezerArtistInfo.success &&
    deezerArtistInfo.data.data.length > 0
  ) {
    inlineKeyboard.url(lang(ctxLang, 'deezerButton'), deezerArtistInfo.data.data[0].link)
  }
  const response = await ctxReply(ctx, undefined, getPnartistText(ctxLang, userInfo.data, artistInfo.data, defaultUserArtistTopTracks, defaultUserArtistTotalPlaytime, spotifyArtistInfo.data[0], mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  if (response === undefined) return
  const userArtistTopTracks = await userArtistTopTracksRequest
  const userArtistTotalPlaytimeRequest = getTracksTotalPlaytime(userArtistTopTracks.data)
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getPnartistText(ctxLang, userInfo.data, artistInfo.data, userArtistTopTracks, defaultUserArtistTotalPlaytime, spotifyArtistInfo.data[0], mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  const userArtistTotalPlaytime = await userArtistTotalPlaytimeRequest
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getPnartistText(ctxLang, userInfo.data, artistInfo.data, userArtistTopTracks, userArtistTotalPlaytime, spotifyArtistInfo.data[0], mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
}
