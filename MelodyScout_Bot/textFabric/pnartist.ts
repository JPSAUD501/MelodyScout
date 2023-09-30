import { Artist } from 'spotify-api.js'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'
import { UserTopTracks } from '../../api/msLastfmApi/types/zodUserTopTracks'

export function getPnartistText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, userArtistTopTracks: Array<UserTopTracks['toptracks']['track']['0']>, spotifyArtistInfo: Artist, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo

  const postTextArray: string[] = []
  postTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postTextArray.push('')
  postTextArray.push('[🎧] Sobre o artista')
  postTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)
  postTextArray.push('')
  postTextArray.push(`[📊] ${Number(artist.stats.userplaycount).toLocaleString('pt-BR')} Scrobbles`)
  const postInfoArray: string[] = []
  if (spotifyArtistInfo.popularity !== undefined) postInfoArray.push(`A popularidade atual desse artista é: [${spotifyArtistInfo.popularity}][${'★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))}]`)
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
  postTextArray.push(`${spotifyArtistInfo.externalURL.spotify}`)
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  textArray.push(`<a href="${spotifyArtistInfo.images?.[0]?.url ?? ''}">️️</a><a href="${artist.image[artist.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a><b><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push('<b>[🎧] Ouvindo o artista</b>')
      break
    case false:
      textArray.push('<b>[🎧] Último artista ouvido</b>')
      break
  }
  textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  const infoArray: string[] = []
  if (spotifyArtistInfo.popularity !== undefined) infoArray.push(`- A <a href="${melodyScoutConfig.popularityImgUrl}">popularidade</a> atual desse artista é: <b>[${spotifyArtistInfo.popularity}][${'★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))}]</b>`)
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(`<b>[📊] ${Number(artist.stats.userplaycount).toLocaleString('pt-BR')} Scrobbles</b>`)
  textArray.push('')
  if (userArtistTopTracks.length > 0) {
    textArray.push('<b>[🎶] As suas mais ouvidas</b>')
    for (let i = 0; i < userArtistTopTracks.length && i < 5; i++) {
      const track = userArtistTopTracks[i]
      textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a>`)
    }
    textArray.push('')
  }
  textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)

  const text = textArray.join('\n')
  return text
}
