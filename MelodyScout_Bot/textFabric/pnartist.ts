import { Artist } from 'spotify-api.js'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { sanitizeText } from '../../function/sanitizeText'
import config from '../../config'

export function getPnartistText (userInfo: UserInfo, artistInfo: ArtistInfo, spotifyArtistInfo: Artist, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${spotifyArtistInfo.images?.[0].url ?? ''}">️️</a><a href="${artist.image[user.image.length - 1]['#text']}">️️</a><a href="${config.melodyScout.userImgUrl}">️️</a><a href="${user.url}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push('<b>[🎧] Ouvindo o artista</b>')
      break
    case false:
      textArray.push('<b>[🎧] Último artista ouvido</b>')
      break
  }
  textArray.push(`- Artista: <b><a href="${artist.url}">${sanitizeText(artist.name)}</a></b>`)
  const infoArray: string[] = []
  if (spotifyArtistInfo.popularity !== undefined) infoArray.push(`- A <a href="${config.melodyScout.popularityImgUrl}">popularidade</a> atual desse artista é: <b>[${spotifyArtistInfo.popularity}][${'★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))}]</b>`)
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(`<b>[📊] ${artist.stats.userplaycount} Scrobbles</b>`)

  const text = textArray.join('\n')
  return text
}
