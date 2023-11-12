import { type InlineQueryContext, type Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { type InlineQueryResult } from 'grammy/types'
import { MsLastfmApi } from '../../../../api/msLastfmApi/base'
import { MsMusicApi } from '../../../../api/msMusicApi/base'
import { melodyScoutConfig, lastfmConfig, spotifyConfig } from '../../../../config'
import { lang } from '../../../../translations/base'
import { getPlayingnowText } from '../../../textFabric/playingnow'
import { MsDeezerApi } from '../../../../api/msDeezerApi/base'
import { type DeezerTrack } from '../../../../api/msDeezerApi/types/zodSearchTrack'
import { getTrackPreview } from '../../../../functions/getTrackPreview'
import { type Track } from '@soundify/web-api'

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
          description: lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }), { parse_mode: 'HTML' })
    }
  }
  if (!userRecentTracks.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'unableToGetUserRecentTracksHistory', value: 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, { key: 'unableToGetUserRecentTracksHistory', value: 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    }
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'noRecentTracksError', value: 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, { key: 'noRecentTracksError', value: 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
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
  const trackPreviewRequest = getTrackPreview(mainTrack.trackName, mainTrack.artistName, ctx)
  const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo, deezerTrackInfo, trackPreview] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest, deezerTrackInfoRequest, trackPreviewRequest])
  if (!artistInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'lastfmArtistDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, { key: 'lastfmArtistDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    }
  }
  if (!albumInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'lastfmAlbumDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, { key: 'lastfmAlbumDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    }
  }
  if (!trackInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'lastfmTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.trackImgUrl
        })
        .text(lang(ctxLang, { key: 'lastfmTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    }
  }
  // if (!spotifyTrackInfo.success) {
  //   return {
  //     success: false,
  //     result: InlineQueryResultBuilder
  //       .article(resultId, resultName, {
  //         description: lang(ctxLang, { key: 'spotifyTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
  //         thumbnail_url: melodyScoutConfig.trackImgUrl
  //       })
  //       .text(lang(ctxLang, { key: 'spotifyTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
  //   }
  // }
  const spotifyTrack: Track | undefined = spotifyTrackInfo.success && spotifyTrackInfo.data.length > 0 ? spotifyTrackInfo.data[0] : undefined
  const deezerTrack: DeezerTrack | undefined = deezerTrackInfo.success && deezerTrackInfo.data.data.length > 0 ? deezerTrackInfo.data.data[0] : undefined
  const trackPreviewUrl = trackPreview.success ? trackPreview.telegramPreviewUrl : undefined
  const inlineKeyboard = new InlineKeyboard()
  // inlineKeyboard.url(lang(ctxLang, { key: 'spotifyButton', value: '[🎧] - Spotify' }), spotifyTrackInfo.data[0].external_urls.spotify)
  if (spotifyTrack !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'spotifyButton', value: '[🎧] - Spotify' }), spotifyTrack.external_urls.spotify)
  if (deezerTrack !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'deezerButton', value: '[🎧] - Deezer' }), deezerTrack.link)
  inlineKeyboard.row()
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeButton', value: '[🎥] - YouTube' }), youtubeTrackInfo.videoUrl)
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeMusicButton', value: '[🎶] - YT Music' }), youtubeTrackInfo.videoMusicUrl)
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
      .text(getPlayingnowText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrack, deezerTrack, mainTrack.nowPlaying, trackPreviewUrl), { parse_mode: 'HTML' })
  }
}
