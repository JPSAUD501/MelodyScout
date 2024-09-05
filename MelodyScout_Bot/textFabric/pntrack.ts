import { type Track } from '@soundify/web-api'
import { type AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { type ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { type TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { type DeezerTrack } from '../../api/msDeezerApi/types/zodSearchTrack'
import { lang } from '../../translations/base'

export function getPntrackText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track | undefined, deezerTrackInfo: DeezerTrack | undefined, nowPlaying: boolean, previewUrl: string | undefined): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const { track } = trackInfo
  let trackDuration = 0
  switch (true) {
    default: {
      if (Number(track.duration) > 0) {
        trackDuration = Number(track.duration) / 1000
        break
      }
      if (spotifyTrackInfo !== undefined && spotifyTrackInfo.duration_ms > 0) {
        trackDuration = spotifyTrackInfo.duration_ms / 1000
        break
      }
      if (deezerTrackInfo !== undefined && deezerTrackInfo.duration > 0) {
        trackDuration = deezerTrackInfo.duration
        break
      }
    }
  }

  const postTextArray: string[] = []
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostUserAtMelodyScoutBot', value: '{{userRealname}} no t.me/melodyscoutbot' }, { userRealname: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) }))
  postTextArray.push('')
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostTrackHeader', value: '[🎧{{badge}}] {{trackName}}' }, { badge: spotifyTrackInfo?.explicit === true ? '-🅴' : '', trackName: sanitizeText(track.name) }))
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostArtist', value: '- Artista: {{artistName}}' }, { artistName: sanitizeText(artist.name) }))
  postTextArray.push('')
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostScrobbles', value: '[📊] {{trackScrobbles}} Scrobbles' }, { trackScrobbles: Number(track.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  const postInfoArray: string[] = []
  if (Number(track.userplaycount) > 0 && trackDuration > 0) {
    const playedHours = Math.floor((Number(track.userplaycount) * trackDuration) / 3600)
    const playedMinutes = Math.floor(((Number(track.userplaycount) * trackDuration) % 3600) / 60)
    postInfoArray.push(lang(ctxLang, { key: 'tfPntrackPostTrackTotalPlaytime', value: 'Já ouviu essa música por {{hours}} horas e {{minutes}} minutos.' }, { hours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), minutes: playedMinutes }))
  }
  if (spotifyTrackInfo?.popularity !== undefined) {
    postInfoArray.push(lang(ctxLang, { key: 'tfPntrackPostTrackPopularity', value: '- A popularidade atual dessa música é: [{{trackPopularity}}][{{trackPopularityStars}}]' }, {
      trackPopularity: spotifyTrackInfo.popularity,
      trackPopularityStars: '★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))
    }))
  }
  switch (postInfoArray.length) {
    case 0: {
      break
    }
    case 1: {
      postTextArray.push('')
      postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostOneInfo', value: '[ℹ️] {{info}}' }, { info: postInfoArray[0] }))
      break
    }
    default: {
      postTextArray.push('')
      postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostInfoHeader', value: '[ℹ️] Informações' }))
      postInfoArray.forEach((info) => {
        postTextArray.push(`${info}`)
      })
      break
    }
  }
  postTextArray.push('')
  switch (true) {
    default: {
      if (spotifyTrackInfo?.external_urls.spotify !== undefined) {
        postTextArray.push(`${spotifyTrackInfo.external_urls.spotify}`)
        break
      }
      if (deezerTrackInfo?.link !== undefined) {
        postTextArray.push(`${deezerTrackInfo.link}`)
        break
      }
      postTextArray.push(`${track.url}`)
    }
  }
  postTextArray.push('')
  const postUrl = `https://linkai.me/ms/post?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  switch (nowPlaying) {
    case true:
      textArray.push(`<a href="${previewUrl}">️️</a><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPntrackHeaderNowPlaying', value: '<b><a href="{{userUrl}}">{{userRealname}}</a> está ouvindo</b>' }, { userUrl: urlLimiter(user.url), userRealname: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
    case false:
      textArray.push(`<a href="${previewUrl}">️️</a><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPntrackHeaderLastPlayed', value: '<b><a href="{{userUrl}}">{{userRealname}}</a> estava ouvindo</b>' }, { userUrl: urlLimiter(user.url), userRealname: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
  }
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(lang(ctxLang, { key: 'tfPntrackHeaderNowPlayingTrack', value: '<b>[🎧{{badge}}] Ouvindo a música</b>' }, { badge: spotifyTrackInfo?.explicit === true ? '-🅴' : '' }))
      break
    case false:
      textArray.push(lang(ctxLang, { key: 'tfPntrackHeaderLastPlayedTrack', value: '<b>[🎧{{badge}}] Última música ouvida</b>' }, { badge: spotifyTrackInfo?.explicit === true ? '-🅴' : '' }))
      break
  }
  textArray.push(lang(ctxLang, { key: 'tfPntrackTrackName', value: '- Música: <b><a href="{{trackUrl}}">{{trackName}}</a></b>' }, { trackUrl: urlLimiter(track.url), trackName: sanitizeText(track.name) }))
  textArray.push(lang(ctxLang, { key: 'tfPntrackAlbumName', value: '- Álbum: <b><a href="{{albumUrl}}">{{albumName}}</a></b>' }, { albumUrl: urlLimiter(album.url), albumName: sanitizeText(album.name) }))
  textArray.push(lang(ctxLang, { key: 'tfPntrackArtistName', value: '- Artista: <b><a href="{{artistUrl}}">{{artistName}}</a></b>' }, { artistUrl: urlLimiter(artist.url), artistName: sanitizeText(artist.name) }))
  const infoArray: string[] = []
  if (Number(track.userplaycount) > 0 && trackDuration > 0) {
    const playedHours = Math.floor((Number(track.userplaycount) * trackDuration) / 3600)
    const playedMinutes = Math.floor(((Number(track.userplaycount) * trackDuration) % 3600) / 60)
    infoArray.push(lang(ctxLang, { key: 'tfPntrackInfoTotalPlaytime', value: '- Você já ouviu essa música por <b>{{hours}} horas</b> e <b>{{minutes}} minutos</b>.' }, { hours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), minutes: playedMinutes }))
  }
  if (spotifyTrackInfo?.popularity !== undefined) {
    infoArray.push(lang(ctxLang, { key: 'tfPntrackInfoPopularity', value: '- A <a href="{{popularityHelpImgUrl}}">popularidade</a> atual dessa música é: <b>[{{trackPopularity}}][{{trackPopularityStars}}]</b>' }, {
      popularityHelpImgUrl: melodyScoutConfig.popularityImgUrl,
      trackPopularity: spotifyTrackInfo.popularity,
      trackPopularityStars: '★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))
    }))
  }
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push(lang(ctxLang, { key: 'tfPntrackInfoHeader', value: '<b>[ℹ️] Informações</b>' }))
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(lang(ctxLang, { key: 'tfPntrackScrobbles', value: '<b>[📊] {{trackScrobbles}} Scrobbles</b>' }, { trackScrobbles: Number(track.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  textArray.push('')
  textArray.push(lang(ctxLang, { key: 'tfPntrackShareTitle', value: '<b>[🔗] <a href="{{postUrl}}">Compartilhe!</a></b>' }, { postUrl }))
  if (previewUrl !== undefined) textArray.push('️️')

  const text = textArray.join('\n')
  return text
}
