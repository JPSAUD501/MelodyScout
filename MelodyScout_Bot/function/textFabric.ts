import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'
import { MsSpotifyTrackInfo } from '../../api/msSpotifyApi/base'

export function getHelpText (): string {
  const textArray: string[] = [
    '<b>Meus comandos!</b>',
    '',
    '<b>/start</b> - Inicia o bot',
    '<b>/help</b> - Mostra essa linda mensagem',
    '<b>/contact</b> - Mostra o contato do desenvolvedor',
    '',
    '<b>Aguarde! Mais comandos estão por vir!</b>'
  ]
  const text = textArray.join('\n')
  return text
}

export function getBriefText (userInfo: UserInfo, userRecentTracks: UserRecentTracks): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const textArray: string[] = []

  textArray.push(`<b><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a>Resumo musical de <a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a></b>`)
  textArray.push('')
  if (
    recenttracks.track.length > 0 &&
      (recenttracks.track[0]['@attr'] != null) &&
      recenttracks.track[0]['@attr'].nowplaying === 'true'
  ) {
    const track = recenttracks.track[0]
    textArray.push('<b>[🎧] Ouvindo agora:</b>')
    textArray.push(`- <a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a>`)
    textArray.push('')
  }
  textArray.push('<b>[🏅] Conquistas:</b>')
  textArray.push(`- Músicas ouvidas: <b>${Number(user.playcount)}</b>`)
  textArray.push(`- Músicas conhecidas: <b>${Number(user.track_count)}</b>`)
  textArray.push(`- Músicas repetidas: <b>${Number(user.playcount) - Number(user.track_count)}</b>`)
  textArray.push(`- Artistas conhecidos: <b>${Number(user.artist_count)}</b>`)
  textArray.push(`- Álbuns conhecidos: <b>${Number(user.album_count)}</b>`)
  textArray.push('')
  textArray.push('<b>[📊] Métricas:</b>')
  textArray.push(`- Dentre as suas músicas ouvidas <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)}%</b> são repetidas e <b>${((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)}%</b> são novas.`)
  textArray.push(`- Em média você repete <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)}</b> vezes cada música que conhece.`)
  textArray.push('')
  if (recenttracks.track.length > 0) {
    textArray.push('<b>[📒] Histórico de reprodução:</b>')
    for (let i = 0; i < recenttracks.track.length; i++) {
      const track = recenttracks.track[i]
      if ((track['@attr'] != null) && track['@attr'].nowplaying === 'true') continue
      textArray.push(`- <a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a>`)
    }
    textArray.push('')
  }

  const text = textArray.join('\n')
  return text
}

export function getPlayingnowText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: MsSpotifyTrackInfo, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const { track } = trackInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Ouvindo <a href="${track.url}">${track.name}</a>:</b>`)
      break
    case false:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Última música ouvida:</b>`)
      textArray.push(`- Música: <b><a href="${track.url}">${track.name}</a></b>`)
      break
  }
  if (spotifyTrackInfo.popularity !== undefined) textArray.push(`- Popularidade: <a href="https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/popularity.txt">${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}</a>`)
  textArray.push(`- Álbum: <b><a href="${album.url}">${album.name}</a></b>`)
  textArray.push(`- Artista: <b><a href="${artist.url}">${artist.name}</a></b>`)
  textArray.push('')
  textArray.push('<b>[📊] Scrobbles:</b>')
  textArray.push(`- Música: <b>${Number(track.userplaycount)}</b>`)
  textArray.push(`- Álbum: <b>${Number(album.userplaycount)}</b>`)
  textArray.push(`- Artista: <b>${Number(artist.stats.userplaycount)}</b>`)
  textArray.push('')
  textArray.push('<b>[ℹ️] Informações:</b>')
  if (Number(track.duration) > 0) textArray.push(`- Você já ouviu essa música por <b>${Math.floor(Number(track.userplaycount) * (Number(track.duration) / 1000) / 3600)} horas</b> e <b>${Math.floor((Number(track.userplaycount) * (Number(track.duration) / 1000) / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) / 1000) / 3600)) * 60)} minutos</b>.`)
  textArray.push(`- Essa música representa <b>${((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)}%</b> de todas suas reproduções desse álbum.`)
  textArray.push(`- Essa música representa <b>${((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)}%</b> de todas suas reproduções desse artista.`)
  textArray.push(`- Esse álbum representa <b>${((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)}%</b> de todas suas reproduções desse artista.`)
  textArray.push(`- Esse artista representa <b>${((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)}%</b> de todas suas reproduções.`)
  // textArray.push('')
  // if (track.wiki != null && track.wiki.summary.length > 0) {
  //   textArray.push('<b>[📚] Sobre:</b>')
  //   textArray.push(`- ${track.wiki.summary}`)
  // }

  const text = textArray.join('\n')
  return text
}

export function getHistoryText (userInfo: UserInfo, userRecentTracks: UserRecentTracks): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const textArray: string[] = []

  textArray.push(`<b><a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a><a href="${user.image[user.image.length - 1]['#text']}">️️</a>Histórico de reprodução de <a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a>:</b>`)
  textArray.push('')
  if (recenttracks.track[0]['@attr']?.nowplaying === 'true') {
    const track = recenttracks.track[0]
    textArray.push(`<b>[🎧] Ouvindo agora <a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a></b>`)
    textArray.push('')
  }
  textArray.push('<b>[📒] Histórico de reprodução:</b>')
  if (recenttracks.track.length > 0) {
    for (let i = 0; i < recenttracks.track.length; i++) {
      const track = recenttracks.track[i]
      if ((track['@attr'] != null) && track['@attr'].nowplaying === 'true') continue
      textArray.push(`- <a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a>`)
    }
    textArray.push('')
  }

  const text = textArray.join('\n')
  return text
}

export function getLyricsText (userInfo: UserInfo, userRecentTracks: UserRecentTracks, albumInfo: AlbumInfo, trackLyrics: string, nowPlaying: boolean): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const { album } = albumInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a>Letra da musica que <a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(`<b>[🎧] Ouvindo <a href="${recenttracks.track[0].url}">${recenttracks.track[0].name}</a>:</b>`)
      break
    case false:
      textArray.push('<b>[🎧] Última música ouvida:</b>')
      textArray.push(`- Música: <b><a href="${recenttracks.track[0].url}">${recenttracks.track[0].name}</a></b>`)
      break
  }
  textArray.push(`- Álbum: <b><a href="${album.url}">${album.name}</a></b>`)
  textArray.push(`- Artista: <b><a href="${recenttracks.track[0].artist.url}">${recenttracks.track[0].artist.name}</a></b>`)
  textArray.push('')
  textArray.push('<b>[📝] Letra:</b>')
  textArray.push(`${trackLyrics}`)

  const text = textArray.join('\n')
  return text
}
