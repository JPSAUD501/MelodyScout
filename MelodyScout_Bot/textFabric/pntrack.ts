import { Track } from 'spotify-api.js'
import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import config from '../../config'
import { sanitizeText } from '../../function/sanitizeText'

export function getPntrackText (userInfo: UserInfo, artistInfo: ArtistInfo | undefined, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo ?? {}
  const { album } = albumInfo
  const { track } = trackInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${config.melodyScout.trackImgUrl}">️️</a><a href="${user.url}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Ouvindo a música</b>`)
      break
    case false:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Última música ouvida</b>`)
      break
  }
  textArray.push(`- Música: <b><a href="${track.url}">${sanitizeText(track.name)}</a></b>`)
  textArray.push(`- Álbum: <b><a href="${album.url}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(`- Artista: <b><a href="${artist?.url ?? ''}">${sanitizeText(track.artist.name)}</a></b>`)
  const infoArray: string[] = []
  if (spotifyTrackInfo.popularity !== undefined) infoArray.push(`- A <a href="${config.melodyScout.popularityImgUrl}">popularidade</a> atual dessa música é: <b>[${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]</b>`)
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(`<b>[📊] ${track.userplaycount} Scrobbles</b>`)

  const text = textArray.join('\n')
  return text
}
