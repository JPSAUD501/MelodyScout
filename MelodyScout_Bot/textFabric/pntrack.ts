import { Track } from 'spotify-api.js'
import { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'

export function getPntrackText (userInfo: UserInfo, artistInfo: ArtistInfo | undefined, albumInfo: AlbumInfo, trackInfo: TrackInfo, spotifyTrackInfo: Track, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo ?? {}
  const { album } = albumInfo
  const { track } = trackInfo
  const textArray: string[] = []

  textArray.push(`<b><a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  textArray.push('')
  switch (nowPlaying) {
    case true:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Ouvindo a música:</b>`)
      break
    case false:
      textArray.push(`<b>[🎧${spotifyTrackInfo.explicit ? '-🅴' : ''}] Última música ouvida:</b>`)
      break
  }
  textArray.push(`- Música: <b><a href="${track.url}">${track.name}</a></b>`)
  textArray.push(`- Álbum: <b><a href="${album.url}">${album.name}</a></b>`)
  textArray.push(`- Artista: <b><a href="${artist?.url ?? ''}">${track.artist.name}</a></b>`)
  textArray.push('')
  textArray.push(`<b>[📊] ${track.userplaycount} Scrobbles</b>`)

  const text = textArray.join('\n')
  return text
}
