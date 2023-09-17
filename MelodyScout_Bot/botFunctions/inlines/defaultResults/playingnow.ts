import { InlineQueryContext, Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { InlineQueryResult } from 'grammy/types'
import { MsLastfmApi } from '../../../../api/msLastfmApi/base'
import { MsMusicApi } from '../../../../api/msMusicApi/base'
import { melodyScoutConfig, lastfmConfig } from '../../../../config'
import { lang } from '../../../../translations/base'
import { getPlayingnowText } from '../../../textFabric/playingnow'

export async function playingnowInlineResult (ctxLang: string | undefined, lastfmUser: string, msMusicApi: MsMusicApi, ctx: InlineQueryContext<Context>): Promise<{
  success: boolean
  result: InlineQueryResult
}> {
  const resultId = 'PN'
  const resultName = 'Playing now!'
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }), { parse_mode: 'HTML' })
    }
  }
  if (!userRecentTracks.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'unableToGetUserRecentTracksHistory'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserRecentTracksHistory'), { parse_mode: 'HTML' })
    }
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'noRecentTracksError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'noRecentTracksError'), { parse_mode: 'HTML' })
    }
  }
  const mainTrack = {
    trackName: userRecentTracks.data.recenttracks.track[0].name,
    trackMbid: userRecentTracks.data.recenttracks.track[0].mbid,
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'false'
  }
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const trackInfoRequest = msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest])
  if (!artistInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmArtistDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmArtistDataNotFoundedError'), { parse_mode: 'HTML' })
    }
  }
  if (!albumInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmAlbumDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmAlbumDataNotFoundedError'), { parse_mode: 'HTML' })
    }
  }
  if (!trackInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmTrackDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'lastfmTrackDataNotFoundedError'), { parse_mode: 'HTML' })
    }
  }
  if (!spotifyTrackInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'spotifyTrackDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, 'spotifyTrackDataNotFoundedError'), { parse_mode: 'HTML' })
    }
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyTrackInfo.data[0].externalURL.spotify)
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, 'youtubeButton'), youtubeTrackInfo.videoUrl)
  inlineKeyboard.row()
  inlineKeyboard.url('Para mais funções conheça o MelodyScout!', `https://t.me/${ctx.me.username}`)
  return {
    success: true,
    result: InlineQueryResultBuilder
      .article(resultId, resultName, {
        description: `${mainTrack.trackName} - ${mainTrack.artistName}`,
        thumbnail_url: albumInfo.data.album.image[albumInfo.data.album.image.length - 1]['#text'] ?? melodyScoutConfig.trackImgUrl,
        reply_markup: inlineKeyboard
      })
      .text(getPlayingnowText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo.data[0], mainTrack.nowPlaying), { parse_mode: 'HTML' })
  }
}
