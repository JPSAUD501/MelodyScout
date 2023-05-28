import { Artist } from 'spotify-api.js'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getPnartistText (userInfo: UserInfo, artistInfo: ArtistInfo, spotifyArtistInfo: Artist, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo

  const tweetTextArray: string[] = []
  tweetTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetTextArray.push('')
  tweetTextArray.push('[🎧] Sobre o artista')
  tweetTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)
  tweetTextArray.push('')
  tweetTextArray.push(`[📊] ${Number(artist.stats.userplaycount).toLocaleString('pt-BR')} Scrobbles`)
  const tweetInfoArray: string[] = []
  if (spotifyArtistInfo.popularity !== undefined) tweetInfoArray.push(`A popularidade atual desse artista é: [${spotifyArtistInfo.popularity}][${'★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))}]`)
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
  tweetTextArray.push(`${spotifyArtistInfo.externalURL.spotify}`)
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  textArray.push(`<b><a href="${spotifyArtistInfo.images?.[0].url ?? ''}">️️</a><a href="${artist.image[user.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
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
  textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(`- <a href="${tweetUrl}">Compartilhar no Twitter!</a>`)

  const text = textArray.join('\n')
  return text
}
