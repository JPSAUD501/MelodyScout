import { type AlbumSimplified } from '@soundify/web-api'
import { type AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { type ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { type TracksTotalPlaytime } from '../../functions/getTracksTotalPlaytime'
import { type UserFilteredTopTracks } from '../../functions/getUserFilteredTopTracks'

export function getPnalbumText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, userAlbumTopTracks: UserFilteredTopTracks, userAlbumTotalPlaytime: TracksTotalPlaytime, spotifyAlbumInfo: AlbumSimplified, nowPlaying: boolean): string {
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
  postTextArray.push(`[📊] ${(album.userplaycount ?? 0).toLocaleString('pt-BR')} Scrobbles`)
  const postInfoArray: string[] = []
  if (userAlbumTotalPlaytime.status === 'success') {
    const playedHours = Math.floor(userAlbumTotalPlaytime.totalPlaytime / 3600)
    const playedMinutes = Math.floor((userAlbumTotalPlaytime.totalPlaytime % 3600) / 60)
    postInfoArray.push(`Já ouviu esse album por <b>${Math.floor(playedHours)} horas</b> e <b>${playedMinutes} minutos</b>`)
  }
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
  postTextArray.push(`${spotifyAlbumInfo.external_urls.spotify}`)
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.albumImgUrl}">️️</a><b><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
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
  switch (true) {
    default: {
      if (userAlbumTotalPlaytime.status === 'loading') {
        infoArray.push('- Carregando tempo de reprodução...')
        break
      }
      if (userAlbumTotalPlaytime.status === 'error') {
        infoArray.push('- Erro ao carregar tempo de reprodução.')
        break
      }
      if (userAlbumTotalPlaytime.status === 'success') {
        const playedHours = Math.floor(userAlbumTotalPlaytime.totalPlaytime / 3600)
        const playedMinutes = Math.floor((userAlbumTotalPlaytime.totalPlaytime % 3600) / 60)
        infoArray.push(`- Você já ouviu esse album por <b>${Math.floor(playedHours)} horas</b> e <b>${playedMinutes} minutos</b>.`)
      }
    }
  }
  if (spotifyAlbumInfo.popularity !== undefined) infoArray.push(`- A <a href="${melodyScoutConfig.popularityImgUrl}">popularidade</a> atual desse album é: <b>[${spotifyAlbumInfo.popularity}][${'★'.repeat(Math.floor(spotifyAlbumInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyAlbumInfo.popularity / 20))}]</b>`)
  if (infoArray.length > 0) {
    textArray.push('')
    textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(...infoArray)
  }
  textArray.push('')
  textArray.push(`<b>[📊] ${(album.userplaycount ?? 0).toLocaleString('pt-BR')} Scrobbles</b>`)
  textArray.push('')
  textArray.push('<b>[🎶] As suas mais ouvidas</b>')
  switch (true) {
    default: {
      if (userAlbumTopTracks.status === 'loading') {
        textArray.push('- Carregando...')
        break
      }
      if (userAlbumTopTracks.status === 'error') {
        textArray.push('- Erro ao carregar musicas.')
        break
      }
      if (userAlbumTopTracks.status === 'success') {
        if (userAlbumTopTracks.data.length <= 0) {
          textArray.push('- Nenhuma musica encontrada.')
          break
        }
        for (let i = 0; i < userAlbumTopTracks.data.length && i < 10; i++) {
          const track = userAlbumTopTracks.data[i]
          textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a>`)
        }
      }
    }
  }
  textArray.push('')
  textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)

  const text = textArray.join('\n')
  return text
}
