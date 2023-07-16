import { CallbackQueryContext, CommandContext, Context, InlineKeyboard } from 'grammy'
import { ctxReply } from '../../../function/grammyFunctions'
import { getPnalbumText } from '../../textFabric/pnalbum'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { lastfmConfig } from '../../../config'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { lang } from '../../../translations/base'

export async function runPnalbumCommand (msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context> | CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    await ctxReply(ctx, lang(ctxLang, 'unableToGetUserIdErrorMessage'))
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserNotRegistered'))
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserNoMoreRegisteredError'))
    return
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }))
    return
  }
  if (!userRecentTracks.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserRecentTracksHistory'))
    return
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    void ctxReply(ctx, lang(ctxLang, 'noRecentTracksError'))
    return
  }
  const mainTrack = {
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const spotifyAlbumInfoRequest = msMusicApi.getSpotifyAlbumInfo(mainTrack.artistName, mainTrack.albumName)
  const [artistInfo, albumInfo, spotifyAlbumInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, spotifyAlbumInfoRequest])
  if (!artistInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmArtistDataNotFoundedError'))
    return
  }
  if (!albumInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmAlbumDataNotFoundedError'))
    return
  }
  if (!spotifyAlbumInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'spotifyAlbumDataNotFoundedError'))
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  if (spotifyAlbumInfo.success) inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyAlbumInfo.data.externalURL.spotify)
  await ctxReply(ctx, getPnalbumText(userInfo.data, artistInfo.data, albumInfo.data, spotifyAlbumInfo.data, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
}
