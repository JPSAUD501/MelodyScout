import { Track } from 'spotify-api.js'
import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'

export function getPlayingnowText (userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track, nowPlaying: boolean): string {
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
    Number(track.userplaycount) > 0 &&
    Number(((Number(track.userplaycount) / Number(artist.stats.userplaycount)) * 100).toFixed(0)) >= 5
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
