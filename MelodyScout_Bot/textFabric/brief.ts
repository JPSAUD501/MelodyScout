import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserTopAlbums } from '../../api/msLastfmApi/types/zodUserTopAlbums'
import { UserTopArtists } from '../../api/msLastfmApi/types/zodUserTopArtists'
import { UserTopTracks } from '../../api/msLastfmApi/types/zodUserTopTracks'
import config from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getBriefText (userInfo: UserInfo, userTopTracks: UserTopTracks, userTopAlbums: UserTopAlbums, userTopArtists: UserTopArtists): string {
  const { user } = userInfo
  const { toptracks } = userTopTracks
  const { topalbums } = userTopAlbums
  const { topartists } = userTopArtists

  const tweetText: {
    metrics: {
      textArray: string[]
      tweetUrl: () => string
    }
    infos: {
      textArray: string[]
      tweetUrl: () => string
    }
    mostPlayedTracks: {
      textArray: string[]
      tweetUrl: () => string
    }
    mostPlayedAlbums: {
      textArray: string[]
      tweetUrl: () => string
    }
    mostPlayedArtists: {
      textArray: string[]
      tweetUrl: () => string
    }
  } = {
    metrics: {
      textArray: [],
      tweetUrl: () => {
        return `https://twitter.com/intent/tweet?text=${tweetText.metrics.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    infos: {
      textArray: [],
      tweetUrl: () => {
        return `https://twitter.com/intent/tweet?text=${tweetText.infos.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedTracks: {
      textArray: [],
      tweetUrl: () => {
        return `https://twitter.com/intent/tweet?text=${tweetText.mostPlayedTracks.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedAlbums: {
      textArray: [],
      tweetUrl: () => {
        return `https://twitter.com/intent/tweet?text=${tweetText.mostPlayedAlbums.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedArtists: {
      textArray: [],
      tweetUrl: () => {
        return `https://twitter.com/intent/tweet?text=${tweetText.mostPlayedArtists.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    }
  }

  tweetText.metrics.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetText.metrics.textArray.push('')
  tweetText.metrics.textArray.push('[📊] Métricas')
  tweetText.metrics.textArray.push(`- Músicas ouvidas: ${Number(user.playcount).toLocaleString('pt-BR')}`)
  tweetText.metrics.textArray.push(`- Músicas conhecidas: ${Number(user.track_count).toLocaleString('pt-BR')}`)
  // tweetText.metrics.textArray.push(`- Músicas repetidas: ${Number(user.playcount) - Number(user.track_count)}`)
  tweetText.metrics.textArray.push(`- Artistas conhecidos: ${Number(user.artist_count).toLocaleString('pt-BR')}`)
  tweetText.metrics.textArray.push(`- Álbuns conhecidos: ${Number(user.album_count).toLocaleString('pt-BR')}`)

  tweetText.infos.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetText.infos.textArray.push('')
  tweetText.infos.textArray.push('[ℹ️] Informações')
  if (((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount)) > ((Number(user.track_count) / Number(user.playcount)))) {
    tweetText.infos.textArray.push(`- ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}% das músicas ouvidas são repetidas.`)
  } else {
    tweetText.infos.textArray.push(`- ${Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString('pt-BR')}% das músicas ouvidas são novas`)
  }
  tweetText.infos.textArray.push(`- Em média repete ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}x cada música que conhece.`)
  tweetText.mostPlayedTracks.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetText.mostPlayedTracks.textArray.push('')
  tweetText.mostPlayedTracks.textArray.push('[🎵] Músicas mais ouvidas')
  for (let i = 0; i < toptracks.track.length && i < 3; i++) {
    const track = toptracks.track[i]
    tweetText.mostPlayedTracks.textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) ${track.name} de ${track.artist.name}`)
  }

  tweetText.mostPlayedAlbums.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetText.mostPlayedAlbums.textArray.push('')
  tweetText.mostPlayedAlbums.textArray.push('[💿] Álbuns mais ouvidos')
  for (let i = 0; i < topalbums.album.length && i < 3; i++) {
    const album = topalbums.album[i]
    tweetText.mostPlayedAlbums.textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) ${album.name} de ${album.artist.name}`)
  }

  tweetText.mostPlayedArtists.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  tweetText.mostPlayedArtists.textArray.push('')
  tweetText.mostPlayedArtists.textArray.push('[👨‍🎤] Artistas mais ouvidos')
  for (let i = 0; i < topartists.artist.length && i < 3; i++) {
    const artist = topartists.artist[i]
    tweetText.mostPlayedArtists.textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) ${artist.name}`)
  }

  const textArray: string[] = []
  textArray.push(`<b><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${config.melodyScout.userImgUrl}">️️</a>Resumo musical de <a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push('')
  switch (true) {
    case (tweetText.metrics.tweetUrl().length < 300): {
      textArray.push(`<b>[📊] Métricas</b> (<i><a href="${tweetText.metrics.tweetUrl()}">Tweetar</a></i>)`)
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
  textArray.push(`<b>[ℹ️] Informações</b> (<i><a href="${tweetText.infos.tweetUrl()}">Tweetar</a></i>)`)
  textArray.push(`- Dentre as suas músicas ouvidas <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são repetidas e <b>${Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são novas.`)
  textArray.push(`- Em média você repete <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}</b> vezes cada música que conhece.`)
  textArray.push('')
  if (toptracks.track.length > 0) {
    switch (true) {
      case (tweetText.mostPlayedTracks.tweetUrl().length < 300): {
        textArray.push(`<b>[🎵] Músicas mais tocadas</b> (<i><a href="${tweetText.mostPlayedTracks.tweetUrl()}">Tweetar</a></i>)`)
        break
      }
      default: {
        textArray.push('<b>[🎵] Músicas mais tocadas</b>')
        break
      }
    }
    for (let i = 0; i < toptracks.track.length; i++) {
      const track = toptracks.track[i]
      textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}"><b>${track.name}</b> de <b>${track.artist.name}</b></a>`)
    }
    textArray.push('')
  }
  if (topalbums.album.length > 0) {
    switch (true) {
      case (tweetText.mostPlayedAlbums.tweetUrl().length < 300): {
        textArray.push(`<b>[💿] Álbuns mais tocados</b> (<i><a href="${tweetText.mostPlayedAlbums.tweetUrl()}">Tweetar</a></i>)`)
        break
      }
      default: {
        textArray.push('<b>[💿] Álbuns mais tocados</b>')
        break
      }
    }
    for (let i = 0; i < topalbums.album.length; i++) {
      const album = topalbums.album[i]
      textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(album.url)}"><b>${album.name}</b> de <b>${album.artist.name}</b></a>`)
    }
    textArray.push('')
  }
  if (topartists.artist.length > 0) {
    switch (true) {
      case (tweetText.mostPlayedArtists.tweetUrl().length < 300): {
        textArray.push(`<b>[👨‍🎤] Artistas mais tocados</b> (<i><a href="${tweetText.mostPlayedArtists.tweetUrl()}">Tweetar</a></i>)`)
        break
      }
      default: {
        textArray.push('<b>[👨‍🎤] Artistas mais tocados</b>')
        break
      }
    }
    for (let i = 0; i < topartists.artist.length; i++) {
      const artist = topartists.artist[i]
      textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(artist.url)}"><b>${artist.name}</b></a>`)
    }
  }

  const text = textArray.join('\n')
  return text
}
