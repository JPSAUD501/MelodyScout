import { type Track } from '@soundify/web-api'
import { type AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { type ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { type TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { lang } from '../../translations/base'
import { type DeezerTrack } from '../../api/msDeezerApi/types/zodSearchTrack'

export function getPlayingnowText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track | undefined, deezerTrackInfo: DeezerTrack | undefined, nowPlaying: boolean | undefined, previewUrl: string | undefined): string {
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
  postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' }, { username: sanitizeText(user.realname.length > 0 ? user.realname : user.name) }))
  postTextArray.push('')
  // postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostTrackName', value: '[🎧{{badge}}] {{trackName}}' }, { badge: spotifyTrackInfo?.explicit === true ? '-🅴' : '', trackName: sanitizeText(track.name) }))
  postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostTrackWithArtistName', value: '[🎧{{badge}}] {{trackName}} por {{artistName}}' }, { badge: spotifyTrackInfo?.explicit === true ? '-🅴' : '', trackName: sanitizeText(track.name), artistName: sanitizeText(artist.name) }))
  // postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostArtistName', value: '- Artista: {{artistName}}' }, { artistName: sanitizeText(artist.name) }))
  postTextArray.push('')
  postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostScrobblesTitle', value: '[📊] Scrobbles' }))
  postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostTrackScrobbles', value: '- Música: {{trackPlaycount}}' }, { trackPlaycount: Number(track.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostArtistScrobbles', value: '- Artista: {{artistPlaycount}}' }, { artistPlaycount: Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  const postInfoArray: string[] = []
  if (Number(track.userplaycount) > 0 && trackDuration > 0) {
    const playedHours = Math.floor((Number(track.userplaycount) * trackDuration) / 3600)
    const playedMinutes = Math.floor(((Number(track.userplaycount) * trackDuration) % 3600) / 60)
    postInfoArray.push(lang(ctxLang, { key: 'tfPlayingnowPostTrackPlaytime', value: 'Já ouviu essa música por {{hours}} horas e {{minutes}} minutos.' }, {
      hours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })),
      minutes: playedMinutes
    }))
  }
  switch (postInfoArray.length) {
    case 0: {
      break
    }
    case 1: {
      postTextArray.push('')
      postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostInfo', value: '[ℹ️] {{info}}' }, { info: postInfoArray[0] }))
      break
    }
    default: {
      postTextArray.push('')
      postTextArray.push(lang(ctxLang, { key: 'tfPlayingnowPostInfoTitle', value: '[ℹ️] Informações' }))
      postInfoArray.forEach((info) => {
        postTextArray.push(`- ${info}`)
      })
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
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  const linksHeader = `<a href="${previewUrl}">️️</a><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a>`
  switch (nowPlaying) {
    case (undefined): {
      break
    }
    case (true): {
      textArray.push(`${linksHeader}${lang(ctxLang, { key: 'tfPlayingnowHeaderNowPlaying', value: '<b><a href="{{userUrl}}">{{username}}</a> está ouvindo</b>' }, {
        userUrl: urlLimiter(user.url),
        username: sanitizeText(user.realname.length > 0 ? user.realname : user.name)
      })}`)
      textArray.push('')
      break
    }
    case (false): {
      textArray.push(`${linksHeader}${lang(ctxLang, { key: 'tfPlayingnowHeaderLastTrack', value: '<b><a href="{{userUrl}}">{{username}}</a> estava ouvindo</b>' }, {
        userUrl: urlLimiter(user.url),
        username: sanitizeText(user.realname.length > 0 ? user.realname : user.name)
      })}`)
      textArray.push('')
      break
    }
  }
  // textArray.push(`${nowPlaying === undefined ? linksHeader : ''}${lang(ctxLang, { key: 'tfPlayingnowTrackInfo', value: '<b>[🎧{{badge}}] <a href="{{trackUrl}}">{{trackName}}</a></b>' }, {
  //   badge: spotifyTrackInfo?.explicit === true ? '-🅴' : '',
  //   trackUrl: urlLimiter(track.url),
  //   trackName: sanitizeText(track.name)
  // })}`)
  textArray.push(`${nowPlaying === undefined ? linksHeader : ''}${lang(ctxLang, { key: 'tfPlayingnowTrackWithArtistInfo', value: '<b>[🎧{{badge}}]</b> <a href="{{trackUrl}}"><b>{{trackName}}</b> por </a><a href="{{artistUrl}}"><b>{{artistName}}</b></a>' }, {
    badge: spotifyTrackInfo?.explicit === true ? '-🅴' : '',
    trackUrl: urlLimiter(track.url),
    trackName: sanitizeText(track.name),
    artistUrl: urlLimiter(artist.url),
    artistName: sanitizeText(artist.name)
  })}`)
  textArray.push(lang(ctxLang, { key: 'tfPlayingnowAlbumName', value: '- Álbum: <b><a href="{{albumUrl}}">{{albumName}}</a></b>' }, {
    albumUrl: urlLimiter(album.url),
    albumName: sanitizeText(album.name)
  }))
  // textArray.push(lang(ctxLang, { key: 'tfPlayingnowArtistName', value: '- Artista: <b><a href="{{artistUrl}}">{{artistName}}</a></b>' }, {
  //   artistUrl: urlLimiter(artist.url),
  //   artistName: sanitizeText(artist.name)
  // }))
  textArray.push('')
  textArray.push(lang(ctxLang, { key: 'tfPlayingnowScrobblesTitle', value: '<b>[📊] Scrobbles</b>' }))
  textArray.push(lang(ctxLang, { key: 'tfPlayingnowTrackScrobbles', value: '- Música: <b>{{trackPlaycount}}</b>' }, { trackPlaycount: Number(track.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  if (album.userplaycount !== undefined) textArray.push(lang(ctxLang, { key: 'tfPlayingnowAlbumScrobbles', value: '- Álbum: <b>{{albumPlaycount}}</b>' }, { albumPlaycount: Number(album.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  textArray.push(lang(ctxLang, { key: 'tfPlayingnowArtistScrobbles', value: '- Artista: <b>{{artistPlaycount}}</b>' }, { artistPlaycount: Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  const infoArray: string[] = []
  if (Number(track.userplaycount) > 0 && trackDuration > 0) {
    const playedHours = Math.floor((Number(track.userplaycount) * trackDuration) / 3600)
    const playedMinutes = Math.floor(((Number(track.userplaycount) * trackDuration) % 3600) / 60)
    infoArray.push(lang(ctxLang, { key: 'tfPlayingnowInfoTrackPlaytime', value: '- Você já ouviu essa música por <b>{{hours}} horas</b> e <b>{{minutes}} minutos</b>.' }, {
      hours: playedHours,
      minutes: playedMinutes
    }))
  }
  if (spotifyTrackInfo?.popularity !== undefined) {
    infoArray.push(lang(ctxLang, { key: 'tfPlayingnowInfoTrackPopularity', value: '- A <a href="{{popularityInfoUrl}}">popularidade</a> atual dessa música é: <b>[{{popularity}}][{{stars}}]</b>' }, {
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
  ) infoArray.push(lang(ctxLang, { key: 'tfPlayingnowInfoTrackAlbumPercentage', value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse álbum.' }, { percentage: Number(((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  if (
    Number(artist.stats.userplaycount) >= Number(track.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(track.userplaycount) > 0 &&
    Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
  ) infoArray.push(lang(ctxLang, { key: 'tfPlayingnowInfoTrackArtistPercentage', value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' }, { percentage: Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  if (
    Number(artist.stats.userplaycount) >= Number(album.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(album.userplaycount) > 0 &&
    Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
  ) infoArray.push(lang(ctxLang, { key: 'tfPlayingnowInfoAlbumArtistPercentage', value: '- Esse álbum representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' }, { percentage: Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  if (
    Number(user.playcount) >= Number(artist.stats.userplaycount) &&
    Number(user.playcount) > 0 &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)) >= 10
  ) infoArray.push(lang(ctxLang, { key: 'tfPlayingnowInfoArtistUserPercentage', value: '- Esse artista representa <b>{{percentage}}%</b> de todas suas reproduções.' }, { percentage: Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push(lang(ctxLang, { key: 'tfPlayingnowInfoTitle', value: '<b>[ℹ️] Informações</b>' }))
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(lang(ctxLang, { key: 'tfPlayingnowShareTitle', value: '<b>[🔗] Compartilhe</b>' }))
  textArray.push(lang(ctxLang, { key: 'tfPlayingnowShareLink', value: '- <a href="{{postUrl}}">Compartilhar no 𝕏!</a>' }, { postUrl }))
  if (previewUrl !== undefined) textArray.push('️️')

  const text = textArray.join('\n')
  return text
}
