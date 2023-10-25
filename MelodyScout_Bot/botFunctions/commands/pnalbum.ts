import { type CallbackQueryContext, type CommandContext, type Context, InlineKeyboard } from 'grammy'
import { ctxEditMessage, ctxReply } from '../../../functions/grammyFunctions'
import { getPnalbumText } from '../../textFabric/pnalbum'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { lastfmConfig, spotifyConfig } from '../../../config'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'

import { lang } from '../../../translations/base'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { type UserFilteredTopTracks, getUserFilteredTopTracks } from '../../../functions/getUserFilteredTopTracks'
import { getTracksTotalPlaytime, type TracksTotalPlaytime } from '../../../functions/getTracksTotalPlaytime'

export async function runPnalbumCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context> | CallbackQueryContext<Context>): Promise<void> {
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
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const spotifyAlbumInfoRequest = msMusicApi.getSpotifyAlbumInfo(mainTrack.artistName, mainTrack.albumName)
  const deezerAlbumInfoRequest = new MsDeezerApi().search.album(`${mainTrack.albumName} ${mainTrack.artistName}`, 1)
  const [artistInfo, albumInfo, spotifyAlbumInfo, deezerAlbumInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, spotifyAlbumInfoRequest, deezerAlbumInfoRequest])
  if (!artistInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmArtistDataNotFoundedError'))
    return
  }
  if (!albumInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmAlbumDataNotFoundedError'))
    return
  }
  if (!spotifyAlbumInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'spotifyAlbumDataNotFoundedError'))
    return
  }
  const userAlbumTopTracksRequest = getUserFilteredTopTracks(lastfmUser, mainTrack.artistName, albumInfo.data.album)
  const defaultUserAlbumTopTracksRequest: UserFilteredTopTracks = {
    status: 'loading',
    data: []
  }
  const defaultUserAlbumTotalPlaytime: TracksTotalPlaytime = {
    status: 'loading'
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyAlbumInfo.data[0].external_urls.spotify)
  if (deezerAlbumInfo.success && deezerAlbumInfo.data.data.length > 0) inlineKeyboard.url(lang(ctxLang, 'deezerButton'), deezerAlbumInfo.data.data[0].link)
  const response = await ctxReply(ctx, undefined, getPnalbumText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, defaultUserAlbumTopTracksRequest, defaultUserAlbumTotalPlaytime, spotifyAlbumInfo.data[0], mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  if (response === undefined) return
  const userAlbumTopTracks = await userAlbumTopTracksRequest
  const userAlbumTotalPlaytimeRequest = getTracksTotalPlaytime(userAlbumTopTracks.data)
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getPnalbumText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, userAlbumTopTracks, defaultUserAlbumTotalPlaytime, spotifyAlbumInfo.data[0], mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  const userAlbumTotalPlaytime = await userAlbumTotalPlaytimeRequest
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getPnalbumText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, userAlbumTopTracks, userAlbumTotalPlaytime, spotifyAlbumInfo.data[0], mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
}
