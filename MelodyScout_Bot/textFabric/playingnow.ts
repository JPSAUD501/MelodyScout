import { Track } from 'spotify-api.js'
import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'
import { lang } from '../../translations/base'

export function getPlayingnowText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track, nowPlaying: boolean, firstScrobble: {
  loadingStatus: 'loading' | 'loaded' | 'error'
  unix: number
} | undefined): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const { track } = trackInfo

  const postTextArray: string[] = []
  // postTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postTextArray.push(lang(ctxLang, 'tfPlayingnowPostUserAtMelodyScoutBot', { username: sanitizeText(user.realname.length > 0 ? user.realname : user.name) }))
  postTextArray.push('')
  // postTextArray.push(`[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] ${sanitizeText(track.name)}`)
  postTextArray.push(lang(ctxLang, 'tfPlayingnowPostTrackName', { badge: spotifyTrackInfo.explicit ? '-🅴' : '', trackName: sanitizeText(track.name) }))
  // postTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)
  postTextArray.push(lang(ctxLang, 'tfPlayingnowPostArtistName', { artistName: sanitizeText(artist.name) }))
  postTextArray.push('')
  // postTextArray.push('[📊] Scrobbles')
  postTextArray.push(lang(ctxLang, 'tfPlayingnowPostScrobblesTitle'))
  // postTextArray.push(`- Música: ${Number(track.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode'))}`)
  postTextArray.push(lang(ctxLang, 'tfPlayingnowPostTrackScrobbles', { trackPlaycount: Number(track.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // postTextArray.push(`- Artista: ${Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode'))}`)
  postTextArray.push(lang(ctxLang, 'tfPlayingnowPostArtistScrobbles', { artistPlaycount: Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  const postInfoArray: string[] = []
  if (
    Number(track.userplaycount) > 0 &&
    (
      Number(track.duration) > 0 ||
      Number(spotifyTrackInfo.duration) > 0
    )
  ) {
    // postInfoArray.push(`Já ouviu essa música por ${Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)} horas e ${Math.floor((Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)) * 60)} minutos.`)
    postInfoArray.push(lang(ctxLang, 'tfPlayingnowPostTrackPlaytime', {
      hours: Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600),
      minutes: Math.floor((Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)) * 60)
    }))
  }
  switch (postInfoArray.length) {
    case 0: {
      break
    }
    case 1: {
      postTextArray.push('')
      // postTextArray.push(`[ℹ️] ${postInfoArray[0]}`)
      postTextArray.push(lang(ctxLang, 'tfPlayingnowPostInfo', { info: postInfoArray[0] }))
      break
    }
    default: {
      postTextArray.push('')
      // postTextArray.push('[ℹ️] Informações')
      postTextArray.push(lang(ctxLang, 'tfPlayingnowPostInfoTitle'))
      postInfoArray.forEach((info) => {
        postTextArray.push(`- ${info}`)
      })
    }
  }
  postTextArray.push('')
  postTextArray.push(`${spotifyTrackInfo.externalURL.spotify}`)
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  // textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
  switch (nowPlaying) {
    case (true): {
      textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a>${lang(ctxLang, 'tfPlayingnowHeaderNowPlaying', {
        userUrl: urlLimiter(user.url),
        username: sanitizeText(user.realname.length > 0 ? user.realname : user.name)
      })}`)
      break
    }
    case (false): {
      textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a>${lang(ctxLang, 'tfPlayingnowHeaderLastTrack', {
        userUrl: urlLimiter(user.url),
        username: sanitizeText(user.realname.length > 0 ? user.realname : user.name)
      })}`)
      break
    }
  }
  textArray.push('')
  // switch (nowPlaying) {
  //   case true:
  //     textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Ouvindo <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a></b>`)
  //     break
  //   case false:
  //     textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Última música ouvida</b>`)
  //     textArray.push(`- Música: <b><a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a></b>`)
  //     break
  // }
  textArray.push(lang(ctxLang, 'tfPlayingnowTrackInfo', {
    badge: spotifyTrackInfo.explicit ? '-🅴' : '',
    trackUrl: urlLimiter(track.url),
    trackName: sanitizeText(track.name)
  }))
  // textArray.push(`- Álbum: <b><a href="${urlLimiter(album.url)}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(lang(ctxLang, 'tfPlayingnowAlbumName', {
    albumUrl: urlLimiter(album.url),
    albumName: sanitizeText(album.name)
  }))
  // textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  textArray.push(lang(ctxLang, 'tfPlayingnowArtistName', {
    artistUrl: urlLimiter(artist.url),
    artistName: sanitizeText(artist.name)
  }))
  textArray.push('')
  // textArray.push('<b>[📊] Scrobbles</b>')
  textArray.push(lang(ctxLang, 'tfPlayingnowScrobblesTitle'))
  // textArray.push(`- Música: <b>${Number(track.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode'))}</b>`)
  textArray.push(lang(ctxLang, 'tfPlayingnowTrackScrobbles', { trackPlaycount: Number(track.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // if (album.userplaycount !== undefined) textArray.push(`- Álbum: <b>${Number(album.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode'))}</b>`)
  if (album.userplaycount !== undefined) textArray.push(lang(ctxLang, 'tfPlayingnowAlbumScrobbles', { albumPlaycount: Number(album.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // textArray.push(`- Artista: <b>${Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode'))}</b>`)
  textArray.push(lang(ctxLang, 'tfPlayingnowArtistScrobbles', { artistPlaycount: Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  const infoArray: string[] = []
  if (
    Number(track.userplaycount) > 0 &&
    (
      Number(track.duration) > 0 ||
      Number(spotifyTrackInfo.duration) > 0
    )
  // ) infoArray.push(`- Você já ouviu essa música por <b>${Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)} horas</b> e <b>${Math.floor((Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)) * 60)} minutos</b>.`)
  ) {
    infoArray.push(lang(ctxLang, 'tfPlayingnowInfoTrackPlaytime', {
      hours: Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600),
      minutes: Math.floor((Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)) * 60)
    }))
  }
  // if (spotifyTrackInfo.popularity !== undefined) infoArray.push(`- A <a href="${melodyScoutConfig.popularityImgUrl}">popularidade</a> atual dessa música é: <b>[${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]</b>`)
  if (spotifyTrackInfo.popularity !== undefined) {
    infoArray.push(lang(ctxLang, 'tfPlayingnowInfoTrackPopularity', {
      popularityInfoUrl: melodyScoutConfig.popularityImgUrl,
      popularity: spotifyTrackInfo.popularity,
      stars: (`${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}`)
    }))
  }
  if (
    Number(album.userplaycount) >= Number(track.userplaycount) &&
    Number(album.userplaycount) > 0 &&
    Number(track.userplaycount) > 0 &&
    Number(((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)) !== 100
  // ) infoArray.push(`- Essa música representa <b>${Number(((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode'))}%</b> de todas suas reproduções desse álbum.`)
  ) infoArray.push(lang(ctxLang, 'tfPlayingnowInfoTrackAlbumPercentage', { percentage: Number(((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  if (
    Number(artist.stats.userplaycount) >= Number(track.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(track.userplaycount) > 0 &&
    Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
  // ) infoArray.push(`- Essa música representa <b>${Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode'))}%</b> de todas suas reproduções desse artista.`)
  ) infoArray.push(lang(ctxLang, 'tfPlayingnowInfoTrackArtistPercentage', { percentage: Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  if (
    Number(artist.stats.userplaycount) >= Number(album.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(album.userplaycount) > 0 &&
    Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
  // ) infoArray.push(`- Esse álbum representa <b>${Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode'))}%</b> de todas suas reproduções desse artista.`)
  ) infoArray.push(lang(ctxLang, 'tfPlayingnowInfoAlbumArtistPercentage', { percentage: Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  if (
    Number(user.playcount) >= Number(artist.stats.userplaycount) &&
    Number(user.playcount) > 0 &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)) >= 10
  // ) infoArray.push(`- Esse artista representa <b>${Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode'))}%</b> de todas suas reproduções.`)
  ) infoArray.push(lang(ctxLang, 'tfPlayingnowInfoArtistUserPercentage', { percentage: Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  if (firstScrobble !== undefined) {
    switch (firstScrobble.loadingStatus) {
      case 'loading': {
        // infoArray.push('- Carregando quando você ouviu essa música pela primeira vez...')
        infoArray.push(lang(ctxLang, 'tfPlayingnowInfoFirstScrobbleLoading'))
        break
      }
      case 'loaded': {
        // infoArray.push(`- Sua primeira reprodução dessa música foi em <b>${new Date(firstScrobble.unix).toLocaleString(lang(ctxLang, 'localeLangCode'))} (UTC)</b>.`)
        infoArray.push(lang(ctxLang, 'tfPlayingnowInfoFirstScrobbleLoaded', { date: `${new Date(firstScrobble.unix).toLocaleString(lang(ctxLang, 'localeLangCode'), { timeZone: 'UTC' })} (UTC)` }))
        break
      }
      case 'error': {
        // infoArray.push('- Não foi possível carregar quando você ouviu essa música pela primeira vez.')
        infoArray.push(lang(ctxLang, 'tfPlayingnowInfoFirstScrobbleError'))
        break
      }
    }
  }
  if (infoArray.length > 0) {
    textArray.push('')
    // textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(lang(ctxLang, 'tfPlayingnowInfoTitle'))
    textArray.push(...infoArray)
  }
  textArray.push('')
  // textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(lang(ctxLang, 'tfPlayingnowShareTitle'))
  // textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)
  textArray.push(lang(ctxLang, 'tfPlayingnowShareLink', { postUrl }))

  const text = textArray.join('\n')
  return text
}
