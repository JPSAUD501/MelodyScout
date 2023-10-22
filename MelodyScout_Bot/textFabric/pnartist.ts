import { type Artist } from '@soundify/web-api'
import { type ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { type UserArtistTopTracks } from '../botFunctions/commands/pnartist'

export function getPnartistText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, userArtistTopTracks: UserArtistTopTracks, spotifyArtistInfo: Artist, nowPlaying: boolean): string {
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
  postTextArray.push(`${spotifyArtistInfo.external_urls.spotify}`)
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

  textArray.push('<b>[🎶] As suas mais ouvidas</b>')
  switch (true) {
    case (userArtistTopTracks.status === 'loading'): {
      textArray.push('- Carregando...')
      break
    }
    case (userArtistTopTracks.status === 'error'): {
      textArray.push('- Erro ao carregar musicas')
      break
    }
    case (userArtistTopTracks.status === 'success'): {
      if (userArtistTopTracks.data === undefined) {
        textArray.push('- Erro ao carregar musicas')
        break
      }
      if (userArtistTopTracks.data.length <= 0) {
        textArray.push('- Nenhuma musica encontrada')
        break
      }
      for (let i = 0; i < userArtistTopTracks.data.length && i <= 10; i++) {
        const track = userArtistTopTracks.data[i]
        textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a>`)
      }
    }
  }
  textArray.push('')
  textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)

  const text = textArray.join('\n')
  return text
}
