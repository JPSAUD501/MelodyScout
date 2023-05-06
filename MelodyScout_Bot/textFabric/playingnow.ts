import { Track } from 'spotify-api.js'
import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import config from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getPlayingnowText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const { track } = trackInfo

  const tweetTextArray: string[] = []
  tweetTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetTextArray.push('')
  tweetTextArray.push(`[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] ${sanitizeText(track.name)}`)
  tweetTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)
  tweetTextArray.push('')
  tweetTextArray.push('[📊] Scrobbles')
  tweetTextArray.push(`- Música: ${Number(track.userplaycount).toLocaleString('pt-BR')}`)
  tweetTextArray.push(`- Artista: ${Number(artist.stats.userplaycount).toLocaleString('pt-BR')}`)
  const tweetInfoArray: string[] = []
  if (
    Number(track.userplaycount) > 0 &&
    (
      Number(track.duration) > 0 ||
      Number(spotifyTrackInfo.duration) > 0
    )
  ) {
    tweetInfoArray.push(`Já ouviu essa música por ${Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)} horas e ${Math.floor((Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)) * 60)} minutos.`)
  }
  switch (tweetInfoArray.length) {
    case 0: {
      break
    }
    case 1: {
      tweetTextArray.push('')
      tweetTextArray.push(`[ℹ️] ${tweetInfoArray[0]}`)
      break
    }
    default: {
      tweetTextArray.push('')
      tweetTextArray.push('[ℹ️] Informações')
      tweetInfoArray.forEach((info) => {
        tweetTextArray.push(`- ${info}`)
      })
    }
  }
  tweetTextArray.push('')
  tweetTextArray.push(`${spotifyTrackInfo.externalURL.spotify}`)
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${config.melodyScout.trackImgUrl}">️️</a><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Ouvindo <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a></b>`)
      break
    case false:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Última música ouvida</b>`)
      textArray.push(`- Música: <b><a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a></b>`)
      break
  }
  textArray.push(`- Álbum: <b><a href="${urlLimiter(album.url)}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  textArray.push('')
  textArray.push('<b>[📊] Scrobbles</b>')
  textArray.push(`- Música: <b>${Number(track.userplaycount).toLocaleString('pt-BR')}</b>`)
  if (album.userplaycount !== undefined) textArray.push(`- Álbum: <b>${Number(album.userplaycount).toLocaleString('pt-BR')}</b>`)
  textArray.push(`- Artista: <b>${Number(artist.stats.userplaycount).toLocaleString('pt-BR')}</b>`)
  const infoArray: string[] = []
  if (
    Number(track.userplaycount) > 0 &&
    (
      Number(track.duration) > 0 ||
      Number(spotifyTrackInfo.duration) > 0
    )
  ) infoArray.push(`- Você já ouviu essa música por <b>${Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)} horas</b> e <b>${Math.floor((Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)) * 60)} minutos</b>.`)
  if (spotifyTrackInfo.popularity !== undefined) infoArray.push(`- A <a href="${config.melodyScout.popularityImgUrl}">popularidade</a> atual dessa música é: <b>[${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]</b>`)
  if (
    Number(album.userplaycount) >= Number(track.userplaycount) &&
    Number(album.userplaycount) > 0 &&
    Number(track.userplaycount) > 0 &&
    Number(((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)) !== 100
  ) infoArray.push(`- Essa música representa <b>${Number(((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)).toLocaleString('pt-BR')}%</b> de todas suas reproduções desse álbum.`)
  if (
    Number(artist.stats.userplaycount) >= Number(track.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(track.userplaycount) > 0 &&
    Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
  ) infoArray.push(`- Essa música representa <b>${Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString('pt-BR')}%</b> de todas suas reproduções desse artista.`)
  if (
    Number(artist.stats.userplaycount) >= Number(album.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(album.userplaycount) > 0 &&
    Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
  ) infoArray.push(`- Esse álbum representa <b>${Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)).toLocaleString('pt-BR')}%</b> de todas suas reproduções desse artista.`)
  if (
    Number(user.playcount) >= Number(artist.stats.userplaycount) &&
    Number(user.playcount) > 0 &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)) >= 10
  ) infoArray.push(`- Esse artista representa <b>${Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)).toLocaleString('pt-BR')}%</b> de todas suas reproduções.`)
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(`- <a href="${tweetUrl}">Compartilhar no Twitter!</a>`)

  const text = textArray.join('\n')
  return text
}
