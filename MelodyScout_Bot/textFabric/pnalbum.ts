import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import config from '../../config'
import { sanitizeText } from '../../function/sanitizeText'

export function getPnalbumText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${config.melodyScout.trackImgUrl}">️️</a><a href="${user.url}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push('<b>[🎧] Ouvindo o album</b>')
      break
    case false:
      textArray.push('<b>[🎧] Último album ouvido</b>')
      break
  }
  textArray.push(`- Álbum: <b><a href="${album.url}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(`- Artista: <b><a href="${artist.url}">${sanitizeText(artist.name)}</a></b>`)
  textArray.push('')
  textArray.push(`<b>[📊] ${album.userplaycount !== undefined ? album.userplaycount : 0} Scrobbles</b>`)

  const text = textArray.join('\n')
  return text
}
