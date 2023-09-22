import { CommandContext, Context, InlineKeyboard } from 'grammy'
import { ctxEditMessage, ctxReply } from '../../../function/grammyFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { getCallbackKey } from '../../../function/callbackMaker'
import { getPlayingnowText } from '../../textFabric/playingnow'
import { lastfmConfig } from '../../../config'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { lang } from '../../../translations/base'
import { UserRecentTracks } from '../../../api/msLastfmApi/types/zodUserRecentTracks'
import PromisePool from '@supercharge/promise-pool'

export async function runPlayingnowCommand (msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
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
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1, 1)
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
  const dateNow = new Date().getTime()
  const mainTrack: {
    trackName: string
    trackMbid: string
    albumName: string
    albumMbid: string
    artistName: string
    artistMbid: string
    nowPlaying: boolean
    firstScrobble: {
      loadingStatus: 'loading' | 'loaded' | 'error'
      unix: number
    }
  } = {
    trackName: userRecentTracks.data.recenttracks.track[0].name,
    trackMbid: userRecentTracks.data.recenttracks.track[0].mbid,
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true',
    firstScrobble: {
      loadingStatus: 'loading',
      unix: 0
    }
  }
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const trackInfoRequest = msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest])
  if (!artistInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmArtistDataNotFoundedError'))
    return
  }
  if (!albumInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmAlbumDataNotFoundedError'))
    return
  }
  if (!trackInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmTrackDataNotFoundedError'))
    return
  }
  if (!spotifyTrackInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'spotifyTrackDataNotFoundedError'))
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyTrackInfo.data[0].externalURL.spotify)
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, 'youtubeButton'), youtubeTrackInfo.videoUrl)
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, 'lyricsButton'), getCallbackKey(['TL', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text(lang(ctxLang, 'iaExplanationButton'), getCallbackKey(['TLE', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, 'trackPreviewButton'), getCallbackKey(['TP', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text(lang(ctxLang, 'trackDownloadButton'), getCallbackKey(['TD', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  const partialReplyPromise = ctxReply(ctx, getPlayingnowText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo.data[0], mainTrack.nowPlaying, mainTrack.firstScrobble), { reply_markup: inlineKeyboard })
  await (async (): Promise<void> => {
    const userFirstScrobbles: Array<UserRecentTracks['recenttracks']['track'][0]> = []
    const userAllRecentTracksPageLength = Math.ceil(Number(userRecentTracks.data.recenttracks['@attr'].total) / 1000)
    let stopPool = false
    const userAllRecentTracksPartialResponses = await PromisePool.for(
      Array.from({ length: userAllRecentTracksPageLength }, (_, index) => index + 1).reverse()
    ).withConcurrency(15).process(async (page, _index, pool) => {
      if (stopPool) pool.stop()
      const userPartialRecentTracksRequest = await msLastfmApi.user.getRecentTracks(lastfmUser, 1000, page)
      if (!userPartialRecentTracksRequest.success) {
        stopPool = true
        return userPartialRecentTracksRequest
      }
      for (const userRecentTrack of userPartialRecentTracksRequest.data.recenttracks.track) {
        if (userRecentTrack.name === mainTrack.trackName && userRecentTrack.artist.name === mainTrack.artistName) {
          stopPool = true
        }
      }
      return userPartialRecentTracksRequest
    })
    for (const userAllRecentTracksPartialResponse of userAllRecentTracksPartialResponses.results) {
      if (!userAllRecentTracksPartialResponse.success) {
        mainTrack.firstScrobble.loadingStatus = 'error'
        return
      }
      for (const userRecentTrack of userAllRecentTracksPartialResponse.data.recenttracks.track) {
        if (userRecentTrack.name === mainTrack.trackName && userRecentTrack.artist.name === mainTrack.artistName) {
          userFirstScrobbles.push(userRecentTrack)
        }
      }
    }
    userFirstScrobbles.sort((a, b) => Number(a.date?.uts ?? dateNow) - Number(b.date?.uts ?? dateNow))
    if (userFirstScrobbles.length <= 0) {
      mainTrack.firstScrobble.loadingStatus = 'error'
      return
    }
    mainTrack.firstScrobble.unix = Number(userFirstScrobbles[0].date?.uts ?? dateNow)
    mainTrack.firstScrobble.loadingStatus = 'loaded'
  })()
  const partialReply = await partialReplyPromise
  if (partialReply === undefined) return
  await ctxEditMessage(ctx, { chatId: partialReply.chat.id, messageId: partialReply.message_id }, getPlayingnowText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo.data[0], mainTrack.nowPlaying, mainTrack.firstScrobble), { reply_markup: inlineKeyboard })
}
