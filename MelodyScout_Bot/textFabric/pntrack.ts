import { Track } from 'spotify-api.js'
import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import config from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getPntrackText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const { track } = trackInfo

  const tweetTextArray: string[] = []
  tweetTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetTextArray.push('')
  tweetTextArray.push(`[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] ${track.name}`)
  tweetTextArray.push(`- Artista: ${artist.name}`)
  tweetTextArray.push('')
  tweetTextArray.push(`[📊] ${track.userplaycount} Scrobbles`)
  const tweetInfoArray: string[] = []
  if (spotifyTrackInfo.popularity !== undefined) tweetInfoArray.push(`A popularidade atual dessa música é: [${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]`)
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
      break
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
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Ouvindo a música</b>`)
      break
    case false:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Última música ouvida</b>`)
      break
  }
  textArray.push(`- Música: <b><a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a></b>`)
  textArray.push(`- Álbum: <b><a href="${urlLimiter(album.url)}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  const infoArray: string[] = []
  if (spotifyTrackInfo.popularity !== undefined) infoArray.push(`- A <a href="${config.melodyScout.popularityImgUrl}">popularidade</a> atual dessa música é: <b>[${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]</b>`)
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(`<b>[📊] ${track.userplaycount} Scrobbles</b>`)
  textArray.push('')
  textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(`- <a href="${tweetUrl}">Compartilhar no Twitter!</a>`)

  const text = textArray.join('\n')
  return text
}
