import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserTopAlbums } from '../../api/msLastfmApi/types/zodUserTopAlbums'
import { UserTopArtists } from '../../api/msLastfmApi/types/zodUserTopArtists'
import { UserTopTracks } from '../../api/msLastfmApi/types/zodUserTopTracks'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getBriefText (userInfo: UserInfo, userTopTracks: UserTopTracks, userTopAlbums: UserTopAlbums, userTopArtists: UserTopArtists): string {
  const { user } = userInfo
  const { toptracks } = userTopTracks
  const { topalbums } = userTopAlbums
  const { topartists } = userTopArtists

  const postText: {
    metrics: {
      textArray: string[]
      postUrl: () => string
    }
    infos: {
      textArray: string[]
      postUrl: () => string
    }
    mostPlayedTracks: {
      textArray: string[]
      postUrl: () => string
    }
    mostPlayedAlbums: {
      textArray: string[]
      postUrl: () => string
    }
    mostPlayedArtists: {
      textArray: string[]
      postUrl: () => string
    }
  } = {
    metrics: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.metrics.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    infos: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.infos.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedTracks: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.mostPlayedTracks.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedAlbums: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.mostPlayedAlbums.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedArtists: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.mostPlayedArtists.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    }
  }

  postText.metrics.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.metrics.textArray.push('')
  postText.metrics.textArray.push('[📊] Métricas')
  postText.metrics.textArray.push(`- Músicas ouvidas: ${Number(user.playcount).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(`- Músicas conhecidas: ${Number(user.track_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(`- Artistas conhecidos: ${Number(user.artist_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(`- Álbuns conhecidos: ${Number(user.album_count).toLocaleString('pt-BR')}`)

  postText.infos.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.infos.textArray.push('')
  postText.infos.textArray.push('[ℹ️] Informações')
  if (((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount)) > ((Number(user.track_count) / Number(user.playcount)))) {
    postText.infos.textArray.push(`- ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}% das músicas ouvidas são repetidas.`)
  } else {
    postText.infos.textArray.push(`- ${Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString('pt-BR')}% das músicas ouvidas são novas`)
  }
  postText.infos.textArray.push(`- Em média repete ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}x cada música que conhece.`)
  postText.mostPlayedTracks.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedTracks.textArray.push('')
  postText.mostPlayedTracks.textArray.push('[🎵] Músicas mais ouvidas')
  for (let i = 0; i < toptracks.track.length && i < 3; i++) {
    const track = toptracks.track[i]
    postText.mostPlayedTracks.textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(track.name)} de ${sanitizeText(track.artist.name)}`)
  }

  postText.mostPlayedAlbums.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedAlbums.textArray.push('')
  postText.mostPlayedAlbums.textArray.push('[💿] Álbuns mais ouvidos')
  for (let i = 0; i < topalbums.album.length && i < 3; i++) {
    const album = topalbums.album[i]
    postText.mostPlayedAlbums.textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(album.name)} de ${sanitizeText(album.artist.name)}`)
  }

  postText.mostPlayedArtists.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedArtists.textArray.push('')
  postText.mostPlayedArtists.textArray.push('[👨‍🎤] Artistas mais ouvidos')
  for (let i = 0; i < topartists.artist.length && i < 3; i++) {
    const artist = topartists.artist[i]
    postText.mostPlayedArtists.textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(artist.name)}`)
  }

  const textArray: string[] = []
  textArray.push(`<b><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>Resumo musical de <a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push('')
  switch (true) {
    case (postText.metrics.postUrl().length < 300): {
      textArray.push(`<b>[📊] Métricas</b> (<i><a href="${postText.metrics.postUrl()}">Postar 𝕏</a></i>)`)
      break
    }
    default: {
      textArray.push('<b>[📊] Métricas</b>')
      break
    }
  }
  textArray.push(`- Músicas ouvidas: <b>${Number(user.playcount).toLocaleString('pt-BR')}</b>`)
  textArray.push(`- Músicas conhecidas: <b>${Number(user.track_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(`- Músicas repetidas: <b>${(Number(user.playcount) - Number(user.track_count)).toLocaleString('pt-BR')}</b>`)
  textArray.push(`- Artistas conhecidos: <b>${Number(user.artist_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(`- Álbuns conhecidos: <b>${Number(user.album_count).toLocaleString('pt-BR')}</b>`)
  textArray.push('')
  textArray.push(`<b>[ℹ️] Informações</b> (<i><a href="${postText.infos.postUrl()}">Postar 𝕏</a></i>)`)
  textArray.push(`- Dentre as suas músicas ouvidas <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são repetidas e <b>${Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são novas.`)
  textArray.push(`- Em média você repete <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}</b> vezes cada música que conhece.`)
  textArray.push('')
  if (toptracks.track.length > 0) {
    switch (true) {
      case (postText.mostPlayedTracks.postUrl().length < 300): {
        textArray.push(`<b>[🎵] Músicas mais tocadas</b> (<i><a href="${postText.mostPlayedTracks.postUrl()}">Postar 𝕏</a></i>)`)
        break
      }
      default: {
        textArray.push('<b>[🎵] Músicas mais tocadas</b>')
        break
      }
    }
    for (let i = 0; i < toptracks.track.length; i++) {
      const track = toptracks.track[i]
      textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}"><b>${sanitizeText(track.name)}</b> de <b>${sanitizeText(track.artist.name)}</b></a>`)
    }
    textArray.push('')
  }
  if (topalbums.album.length > 0) {
    switch (true) {
      case (postText.mostPlayedAlbums.postUrl().length < 300): {
        textArray.push(`<b>[💿] Álbuns mais tocados</b> (<i><a href="${postText.mostPlayedAlbums.postUrl()}">Postar 𝕏</a></i>)`)
        break
      }
      default: {
        textArray.push('<b>[💿] Álbuns mais tocados</b>')
        break
      }
    }
    for (let i = 0; i < topalbums.album.length; i++) {
      const album = topalbums.album[i]
      textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(album.url)}"><b>${sanitizeText(album.name)}</b> de <b>${sanitizeText(album.artist.name)}</b></a>`)
    }
    textArray.push('')
  }
  if (topartists.artist.length > 0) {
    switch (true) {
      case (postText.mostPlayedArtists.postUrl().length < 300): {
        textArray.push(`<b>[👨‍🎤] Artistas mais tocados</b> (<i><a href="${postText.mostPlayedArtists.postUrl()}">Postar 𝕏</a></i>)`)
        break
      }
      default: {
        textArray.push('<b>[👨‍🎤] Artistas mais tocados</b>')
        break
      }
    }
    for (let i = 0; i < topartists.artist.length; i++) {
      const artist = topartists.artist[i]
      textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(artist.url)}"><b>${sanitizeText(artist.name)}</b></a>`)
    }
  }

  const text = textArray.join('\n')
  return text
}
