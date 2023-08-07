import { Album } from 'spotify-api.js'
import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getPnalbumText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, spotifyAlbumInfo: Album, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo

  const postTextArray: string[] = []
  postTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postTextArray.push('')
  postTextArray.push('[🎧] Sobre o album')
  postTextArray.push(`- Álbum: ${sanitizeText(album.name)}`)
  postTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)
  postTextArray.push('')
  postTextArray.push(`[📊] ${(album.userplaycount !== undefined ? album.userplaycount : 0).toLocaleString('pt-BR')} Scrobbles`)
  const postInfoArray: string[] = []
  if (spotifyAlbumInfo.popularity !== undefined) postInfoArray.push(`A popularidade atual desse album é: [${spotifyAlbumInfo.popularity}][${'★'.repeat(Math.floor(spotifyAlbumInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyAlbumInfo.popularity / 20))}]`)
  switch (postInfoArray.length) {
    case 0: {
      break
    }
    case 1: {
      postTextArray.push('')
      postTextArray.push(`[ℹ️] ${postInfoArray[0]}`)
      break
    }
    default: {
      postTextArray.push('')
      postTextArray.push('[ℹ️] Informações')
      postInfoArray.forEach((info) => {
        postTextArray.push(`- ${info}`)
      })
      break
    }
  }
  postTextArray.push('')
  postTextArray.push(`${spotifyAlbumInfo.externalURL.spotify}`)
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.trackImgUrl}">️️</a><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push('<b>[🎧] Ouvindo o album</b>')
      break
    case false:
      textArray.push('<b>[🎧] Último album ouvido</b>')
      break
  }
  textArray.push(`- Álbum: <b><a href="${urlLimiter(album.url)}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  const infoArray: string[] = []
  if (spotifyAlbumInfo.popularity !== undefined) infoArray.push(`- A <a href="${melodyScoutConfig.popularityImgUrl}">popularidade</a> atual desse album é: <b>[${spotifyAlbumInfo.popularity}][${'★'.repeat(Math.floor(spotifyAlbumInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyAlbumInfo.popularity / 20))}]</b>`)
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(`<b>[📊] ${(album.userplaycount !== undefined ? album.userplaycount : 0).toLocaleString('pt-BR')} Scrobbles</b>`)
  textArray.push('')
  textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)

  const text = textArray.join('\n')
  return text
}
