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

export function getPntrackText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track, deezerTrackInfo: DeezerTrack | undefined, nowPlaying: boolean): string {
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
      if (spotifyTrackInfo.duration_ms > 0) {
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
  // postTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostUserAtMelodyScoutBot', value: '{{userRealname}} no @MelodyScoutBot' }, { userRealname: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) }))
  postTextArray.push('')
  // postTextArray.push(`[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] ${sanitizeText(track.name)}`)
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostTrackHeader', value: '[🎧{{badge}}] {{trackName}}' }, { badge: spotifyTrackInfo.explicit ? '-🅴' : '', trackName: sanitizeText(track.name) }))
  // postTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostArtist', value: '- Artista: {{artistName}}' }, { artistName: sanitizeText(artist.name) }))
  postTextArray.push('')
  // postTextArray.push(`[📊] ${Number(track.userplaycount).toLocaleString('pt-BR')} Scrobbles`)
  postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostScrobbles', value: '[📊] {{trackScrobbles}} Scrobbles' }, { trackScrobbles: Number(track.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  const postInfoArray: string[] = []
  if (Number(track.userplaycount) > 0 && trackDuration > 0) {
    const playedHours = Math.floor((Number(track.userplaycount) * trackDuration) / 3600)
    const playedMinutes = Math.floor(((Number(track.userplaycount) * trackDuration) % 3600) / 60)
    // postInfoArray.push(`Já ouviu essa música por ${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas e ${playedMinutes} minutos.`)
    postInfoArray.push(lang(ctxLang, { key: 'tfPntrackPostTrackTotalPlaytime', value: 'Já ouviu essa música por {{hours}} horas e {{minutes}} minutos.' }, { hours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), minutes: playedMinutes }))
  }
  // if (spotifyTrackInfo.popularity !== undefined) postInfoArray.push(`- A popularidade atual dessa música é: [${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]`)
  if (spotifyTrackInfo.popularity !== undefined) {
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
      // postTextArray.push(`[ℹ️] ${postInfoArray[0]}`)
      postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostOneInfo', value: '[ℹ️] {{info}}' }, { info: postInfoArray[0] }))
      break
    }
    default: {
      postTextArray.push('')
      // postTextArray.push('[ℹ️] Informações')
      postTextArray.push(lang(ctxLang, { key: 'tfPntrackPostInfoHeader', value: '[ℹ️] Informações' }))
      postInfoArray.forEach((info) => {
        postTextArray.push(`${info}`)
      })
      break
    }
  }
  postTextArray.push('')
  postTextArray.push(`${spotifyTrackInfo.external_urls.spotify}`)
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  // textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
  switch (nowPlaying) {
    case true:
      textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPntrackHeaderNowPlaying', value: '<b><a href="{{userUrl}}">{{userRealname}}</a> está ouvindo</b>' }, { userUrl: urlLimiter(user.url), userRealname: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
    case false:
      textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPntrackHeaderLastPlayed', value: '<b><a href="{{userUrl}}">{{userRealname}}</a> estava ouvindo</b>' }, { userUrl: urlLimiter(user.url), userRealname: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
  }
  textArray.push('')
  switch (nowPlaying) {
    case true:
      // textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Ouvindo a música</b>`)
      textArray.push(lang(ctxLang, { key: 'tfPntrackHeaderNowPlayingTrack', value: '<b>[🎧{{badge}}] Ouvindo a música</b>' }, { badge: spotifyTrackInfo.explicit ? '-🅴' : '' }))
      break
    case false:
      // textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Última música ouvida</b>`)
      textArray.push(lang(ctxLang, { key: 'tfPntrackHeaderLastPlayedTrack', value: '<b>[🎧{{badge}}] Última música ouvida</b>' }, { badge: spotifyTrackInfo.explicit ? '-🅴' : '' }))
      break
  }
  // textArray.push(`- Música: <b><a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfPntrackTrackName', value: '- Música: <b><a href="{{trackUrl}}">{{trackName}}</a></b>' }, { trackUrl: urlLimiter(track.url), trackName: sanitizeText(track.name) }))
  // textArray.push(`- Álbum: <b><a href="${urlLimiter(album.url)}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfPntrackAlbumName', value: '- Álbum: <b><a href="{{albumUrl}}">{{albumName}}</a></b>' }, { albumUrl: urlLimiter(album.url), albumName: sanitizeText(album.name) }))
  // textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfPntrackArtistName', value: '- Artista: <b><a href="{{artistUrl}}">{{artistName}}</a></b>' }, { artistUrl: urlLimiter(artist.url), artistName: sanitizeText(artist.name) }))
  const infoArray: string[] = []
  if (Number(track.userplaycount) > 0 && trackDuration > 0) {
    const playedHours = Math.floor((Number(track.userplaycount) * trackDuration) / 3600)
    const playedMinutes = Math.floor(((Number(track.userplaycount) * trackDuration) % 3600) / 60)
    // infoArray.push(`- Você já ouviu essa música por <b>${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas</b> e <b>${playedMinutes} minutos</b>.`)
    infoArray.push(lang(ctxLang, { key: 'tfPntrackInfoTotalPlaytime', value: '- Você já ouviu essa música por <b>{{hours}} horas</b> e <b>{{minutes}} minutos</b>.' }, { hours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), minutes: playedMinutes }))
  }
  // if (spotifyTrackInfo.popularity !== undefined) infoArray.push(`- A <a href="${melodyScoutConfig.popularityImgUrl}">popularidade</a> atual dessa música é: <b>[${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]</b>`)
  if (spotifyTrackInfo.popularity !== undefined) {
    infoArray.push(lang(ctxLang, { key: 'tfPntrackInfoPopularity', value: '- A <a href="{{popularityHelpImgUrl}}">popularidade</a> atual dessa música é: <b>[{{trackPopularity}}][{{trackPopularityStars}}]</b>' }, {
      popularityHelpImgUrl: melodyScoutConfig.popularityImgUrl,
      trackPopularity: spotifyTrackInfo.popularity,
      trackPopularityStars: '★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))
    }))
  }
  if (infoArray.length > 0) {
    textArray.push('')
    // textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(lang(ctxLang, { key: 'tfPntrackInfoHeader', value: '<b>[ℹ️] Informações</b>' }))
    textArray.push(...infoArray)
  }
  textArray.push('')
  // textArray.push(`<b>[📊] ${Number(track.userplaycount).toLocaleString('pt-BR')} Scrobbles</b>`)
  textArray.push(lang(ctxLang, { key: 'tfPntrackScrobbles', value: '<b>[📊] {{trackScrobbles}} Scrobbles</b>' }, { trackScrobbles: Number(track.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  textArray.push('')
  // textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(lang(ctxLang, { key: 'tfPntrackShareHeader', value: '<b>[🔗] Compartilhe</b>' }))
  // textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)
  textArray.push(lang(ctxLang, { key: 'tfPntrackShareOnX', value: '- <a href="{{postUrl}}">Compartilhar no 𝕏!</a>' }, { postUrl }))

  const text = textArray.join('\n')
  return text
}
