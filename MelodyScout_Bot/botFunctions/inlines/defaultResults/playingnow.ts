import { type InlineQueryContext, type Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { type InlineQueryResult } from 'grammy/types'
import { MsLastfmApi } from '../../../../api/msLastfmApi/base'
import { MsMusicApi } from '../../../../api/msMusicApi/base'
import { melodyScoutConfig, lastfmConfig, spotifyConfig } from '../../../../config'
import { lang } from '../../../../translations/base'
import { getPlayingnowText } from '../../../textFabric/playingnow'
import { MsDeezerApi } from '../../../../api/msDeezerApi/base'

export async function playingnowInlineResult (ctxLang: string | undefined, lastfmUser: string, ctx: InlineQueryContext<Context>): Promise<{
  success: boolean
  result: InlineQueryResult
}> {
  const resultId = 'PN'
  const resultName = 'Playing now!'
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1, 1)
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
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const trackInfoRequest = msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const deezerTrackInfoRequest = new MsDeezerApi().search.track(mainTrack.trackName, mainTrack.artistName, 1)
  const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo, deezerTrackInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest, deezerTrackInfoRequest])
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
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyTrackInfo.data[0].external_urls.spotify)
  if (deezerTrackInfo.success && deezerTrackInfo.data.data.length > 0) inlineKeyboard.url(lang(ctxLang, 'deezerButton'), deezerTrackInfo.data.data[0].link)
  inlineKeyboard.row()
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, 'youtubeButton'), youtubeTrackInfo.videoUrl)
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, 'youtubeMusicButton'), youtubeTrackInfo.videoMusicUrl)
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
