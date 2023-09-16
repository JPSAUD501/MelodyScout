import { Context, InlineKeyboard, InlineQueryContext, InlineQueryResultBuilder } from 'grammy'
import { lang } from '../../../translations/base'
import { getCallbackKey } from '../../../function/callbackMaker'
import { ctxAnswerInlineQuery } from '../../../function/grammyFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lastfmConfig, melodyScoutConfig } from '../../../config'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { getPlayingnowText } from '../../textFabric/playingnow'
import { InlineQueryResultArticle } from 'grammy/types'

async function playingnowInlineResult (ctxLang: string | undefined, msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: InlineQueryContext<Context>): Promise<InlineQueryResultArticle> {
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'unableToGetUserIdErrorMessage'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserIdErrorMessage'), { parse_mode: 'HTML' })
    )
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'unableToGetUserInfoInDb'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserInfoInDb'), { parse_mode: 'HTML' })
    )
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'lastfmUserNotRegistered'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmUserNotRegistered'), { parse_mode: 'HTML' })
    )
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'unableToGetUserInfoInDb'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserInfoInDb'), { parse_mode: 'HTML' })
    )
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'lastfmUserNoMoreRegisteredError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmUserNoMoreRegisteredError'), { parse_mode: 'HTML' })
    )
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }), { parse_mode: 'HTML' })
    )
  }
  if (!userRecentTracks.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'unableToGetUserRecentTracksHistory'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserRecentTracksHistory'), { parse_mode: 'HTML' })
    )
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'noRecentTracksError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'noRecentTracksError'), { parse_mode: 'HTML' })
    )
  }
  const mainTrack = {
    trackName: userRecentTracks.data.recenttracks.track[0].name,
    trackMbid: userRecentTracks.data.recenttracks.track[0].mbid,
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const trackInfoRequest = msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest])
  if (!artistInfo.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'lastfmArtistDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmArtistDataNotFoundedError'), { parse_mode: 'HTML' })
    )
  }
  if (!albumInfo.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'lastfmAlbumDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmAlbumDataNotFoundedError'), { parse_mode: 'HTML' })
    )
  }
  if (!trackInfo.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'lastfmTrackDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmTrackDataNotFoundedError'), { parse_mode: 'HTML' })
    )
  }
  if (!spotifyTrackInfo.success) {
    return (
      InlineQueryResultBuilder
        .article('PN', 'Playing now!', {
          description: lang(ctxLang, 'spotifyTrackDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'spotifyTrackDataNotFoundedError'), { parse_mode: 'HTML' })
    )
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyTrackInfo.data.externalURL.spotify)
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, 'youtubeButton'), youtubeTrackInfo.videoUrl)
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, 'lyricsButton'), getCallbackKey(['TL', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text(lang(ctxLang, 'iaExplanationButton'), getCallbackKey(['TLE', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, 'trackPreviewButton'), getCallbackKey(['TP', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text(lang(ctxLang, 'trackDownloadButton'), getCallbackKey(['TD', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  return (
    InlineQueryResultBuilder
      .article('PN', 'Playing now!', {
        description: `${mainTrack.trackName} - ${mainTrack.artistName}`,
        thumbnail_url: albumInfo.data.album.image[albumInfo.data.album.image.length - 1]['#text'] ?? melodyScoutConfig.trackImgUrl,
        reply_markup: inlineKeyboard
      })
      .text(getPlayingnowText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo.data, mainTrack.nowPlaying), { parse_mode: 'HTML' })
  )
}

export async function runDefaultInline (msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: InlineQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const inlineQueryResults: InlineQueryResultArticle[] = []
  inlineQueryResults.push(await playingnowInlineResult(ctxLang, msMusicApi, msPrismaDbApi, ctx))

  await ctxAnswerInlineQuery(ctx, inlineQueryResults, { cache_time: 20 })
}
