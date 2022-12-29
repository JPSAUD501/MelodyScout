import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'
import { UserTopAlbums } from '../../api/msLastfmApi/types/zodUserTopAlbums'
import { UserTopArtists } from '../../api/msLastfmApi/types/zodUserTopArtists'
import { UserTopTracks } from '../../api/msLastfmApi/types/zodUserTopTracks'
import { MsMusicApiSpotifyTrackInfo } from '../../api/msMusicApi/base'

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

export function getBriefText (userInfo: UserInfo, userRecentTracks: UserRecentTracks, userTopTracks: UserTopTracks, userTopAlbums: UserTopAlbums, userTopArtists: UserTopArtists): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const { toptracks } = userTopTracks
  const { topalbums } = userTopAlbums
  const { topartists } = userTopArtists
  const textArray: string[] = []

  textArray.push(`<b><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${toptracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a>Resumo musical de <a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a></b>`)
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
  textArray.push('<b>[📊] Métricas:</b>')
  textArray.push(`- Músicas ouvidas: <b>${Number(user.playcount)}</b>`)
  textArray.push(`- Músicas conhecidas: <b>${Number(user.track_count)}</b>`)
  textArray.push(`- Músicas repetidas: <b>${Number(user.playcount) - Number(user.track_count)}</b>`)
  textArray.push(`- Artistas conhecidos: <b>${Number(user.artist_count)}</b>`)
  textArray.push(`- Álbuns conhecidos: <b>${Number(user.album_count)}</b>`)
  textArray.push('')
  textArray.push('<b>[ℹ️] Informações:</b>')
  textArray.push(`- Dentre as suas músicas ouvidas <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)}%</b> são repetidas e <b>${((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)}%</b> são novas.`)
  textArray.push(`- Em média você repete <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)}</b> vezes cada música que conhece.`)
  textArray.push('')
  if (toptracks.track.length > 0) {
    textArray.push('<b>[🎵] Músicas mais tocadas:</b>')
    for (let i = 0; i < toptracks.track.length; i++) {
      const track = toptracks.track[i]
      textArray.push(`- [${i + 1}] <b><a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a></b>`)
      textArray.push(`  (${track.playcount} Scrobbles)`)
    }
    textArray.push('')
  }
  if (topalbums.album.length > 0) {
    textArray.push('<b>[💿] Álbuns mais tocados:</b>')
    for (let i = 0; i < topalbums.album.length; i++) {
      const album = topalbums.album[i]
      textArray.push(`- [${i + 1}] <b><a href="${album.url}">${album.name}</a> de <a href="${album.artist.url}">${album.artist.name}</a></b>`)
      textArray.push(`  (${album.playcount} Scrobbles)`)
    }
    textArray.push('')
  }
  if (topartists.artist.length > 0) {
    textArray.push('<b>[👨‍🎤] Artistas mais tocados:</b>')
    for (let i = 0; i < topartists.artist.length; i++) {
      const artist = topartists.artist[i]
      textArray.push(`- [${i + 1}] <b><a href="${artist.url}">${artist.name}</a></b>`)
      textArray.push(`  (${artist.playcount} Scrobbles)`)
    }
    // textArray.push('')
  }
  // if (recenttracks.track.length > 0) {
  //   textArray.push('<b>[📒] Histórico de reprodução:</b>')
  //   for (let i = 0; i < recenttracks.track.length; i++) {
  //     const track = recenttracks.track[i]
  //     if ((track['@attr'] != null) && track['@attr'].nowplaying === 'true') continue
  //     textArray.push(`- <a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a>`)
  //   }
  //   textArray.push('')
  // }

  const text = textArray.join('\n')
  return text
}

export function getPlayingnowText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: MsMusicApiSpotifyTrackInfo, nowPlaying: boolean): string {
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
  textArray.push(`- Álbum: <b><a href="${album.url}">${album.name}</a></b>`)
  textArray.push(`- Artista: <b><a href="${artist.url}">${artist.name}</a></b>`)
  textArray.push('')
  textArray.push('<b>[📊] Scrobbles:</b>')
  textArray.push(`- Música: <b>${Number(track.userplaycount)}</b>`)
  if (album.userplaycount !== undefined) textArray.push(`- Álbum: <b>${Number(album.userplaycount)}</b>`)
  textArray.push(`- Artista: <b>${Number(artist.stats.userplaycount)}</b>`)
  textArray.push('')
  const infoArray: string[] = []
  if (
    Number(track.userplaycount) > 0 &&
    (
      Number(track.duration) > 0 ||
      Number(spotifyTrackInfo.duration) > 0
    )
  ) infoArray.push(`- Você já ouviu essa música por <b>${Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)} horas</b> e <b>${Math.floor((Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600 - Math.floor(Number(track.userplaycount) * (Number(track.duration) > 0 ? Number(track.duration) : Number(spotifyTrackInfo.duration)) / 1000 / 3600)) * 60)} minutos</b>.`)
  if (
    spotifyTrackInfo.popularity !== undefined
  ) infoArray.push(`- A <a href="https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/popularity.txt">popularidade</a> atual dessa música é: <b>[${spotifyTrackInfo.popularity}][${'★'.repeat(Math.floor(spotifyTrackInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyTrackInfo.popularity / 20))}]</b>`)
  if (
    Number(album.userplaycount) >= Number(track.userplaycount) &&
    Number(album.userplaycount) > 0 &&
    Number(track.userplaycount) > 0 &&
    Number(((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)) !== 100
  ) infoArray.push(`- Essa música representa <b>${((Number(track.userplaycount) / Number(album.userplaycount)) * 100).toFixed(0)}%</b> de todas suas reproduções desse álbum.`)
  if (
    Number(artist.stats.userplaycount) >= Number(track.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(track.userplaycount) > 0
  ) infoArray.push(`- Essa música representa <b>${((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)}%</b> de todas suas reproduções desse artista.`)
  if (
    Number(artist.stats.userplaycount) >= Number(album.userplaycount) &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(album.userplaycount) > 0 &&
    Number(((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
  ) infoArray.push(`- Esse álbum representa <b>${((Number(album.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)}%</b> de todas suas reproduções desse artista.`)
  if (
    Number(user.playcount) >= Number(artist.stats.userplaycount) &&
    Number(user.playcount) > 0 &&
    Number(artist.stats.userplaycount) > 0 &&
    Number(((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)) >= 10
  ) infoArray.push(`- Esse artista representa <b>${((Number(artist.stats.userplaycount) / Number(user.playcount)) * 100).toFixed(0)}%</b> de todas suas reproduções.`)
  if (infoArray.length > 0) {
    textArray.push('<b>[ℹ️] Informações:</b>')
    textArray.push(...infoArray)
  }
  // textArray.push('')
  // if (track.wiki != null && track.wiki.summary.length > 0) {
  //   textArray.push('<b>[📚] Sobre:</b>')
  //   textArray.push(`- ${track.wiki.summary}`)
  // }

  const text = textArray.join('\n')
  return text
}

export function getPntrackText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: MsMusicApiSpotifyTrackInfo, nowPlaying: boolean): string {
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
  textArray.push(`- Álbum: <b><a href="${album.url}">${album.name}</a></b>`)
  textArray.push(`- Artista: <b><a href="${artist.url}">${artist.name}</a></b>`)
  textArray.push('')
  textArray.push('<b>[📊] Scrobbles:</b>')
  textArray.push(`- Música: <b>${track.userplaycount}</b>`)
  if (album.userplaycount !== undefined) textArray.push(`- Álbum: <b>${Number(album.userplaycount)}</b>`)
  textArray.push(`- Artista: <b>${artist.stats.userplaycount}</b>`)

  const text = textArray.join('\n')
  return text
}

export function getPnalbumText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(`<b>[🎧] Ouvindo o album <a href="${album.url}">${album.name}</a>:</b>`)
      break
    case false:
      textArray.push('<b>[🎧] Último album ouvido:</b>')
      textArray.push(`- Álbum: <b><a href="${album.url}">${album.name}</a></b>`)
      break
  }
  textArray.push(`- Artista: <b><a href="${artist.url}">${artist.name}</a></b>`)
  textArray.push('')
  textArray.push('<b>[📊] Scrobbles:</b>')
  textArray.push(`- Álbum: <b>${Number(album.userplaycount !== undefined ? 0 : album.userplaycount)}</b>`)
  textArray.push(`- Artista: <b>${artist.stats.userplaycount}</b>`)

  const text = textArray.join('\n')
  return text
}

export function getPnartistText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, nowPlaying: boolean): string {
  const { user } = userInfo
  const { album } = albumInfo
  const { artist } = artistInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(`<b>[🎧] Ouvindo o artista <a href="${artist.url}">${artist.name}</a></b>`)
      break
    case false:
      textArray.push('<b>[🎧] Último artista ouvido:</b>')
      textArray.push(`- Artista: <b><a href="${artist.url}">${artist.name}</a></b>`)
      break
  }
  textArray.push('')
  textArray.push('<b>[📊] Scrobbles:</b>')
  textArray.push(`- Artista: <b>${artist.stats.userplaycount}</b>`)

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

export function getLyricsLiteText (track: string, artist: string, trackLyrics: string): string {
  const textArray: string[] = []

  textArray.push(`<b>[📝] Letra de ${track} por ${artist}:</b>`)
  textArray.push('')
  textArray.push(`${trackLyrics}`)

  const text = textArray.join('\n')
  return text
}
