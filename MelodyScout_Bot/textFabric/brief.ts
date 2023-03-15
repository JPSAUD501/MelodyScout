import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'
import { UserTopAlbums } from '../../api/msLastfmApi/types/zodUserTopAlbums'
import { UserTopArtists } from '../../api/msLastfmApi/types/zodUserTopArtists'
import { UserTopTracks } from '../../api/msLastfmApi/types/zodUserTopTracks'
import config from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getBriefText (userInfo: UserInfo, userRecentTracks: UserRecentTracks, userTopTracks: UserTopTracks, userTopAlbums: UserTopAlbums, userTopArtists: UserTopArtists): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const { toptracks } = userTopTracks
  const { topalbums } = userTopAlbums
  const { topartists } = userTopArtists
  const textArray: string[] = []

  textArray.push(`<b><a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${config.melodyScout.userImgUrl}">️️</a>Resumo musical de <a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push('')
  if (
    recenttracks.track.length > 0 &&
      (recenttracks.track[0]['@attr'] != null) &&
      recenttracks.track[0]['@attr'].nowplaying === 'true'
  ) {
    const track = recenttracks.track[0]
    textArray.push('<b>[🎧] Ouvindo agora</b>')
    textArray.push(`- <a href="${urlLimiter(track.url)}">${track.name}</a> de <a href="${urlLimiter(track.artist.url)}">${track.artist.name}</a>`)
    textArray.push('')
  }
  textArray.push('<b>[📊] Métricas</b>')
  textArray.push(`- Músicas ouvidas: <b>${Number(user.playcount)}</b>`)
  textArray.push(`- Músicas conhecidas: <b>${Number(user.track_count)}</b>`)
  textArray.push(`- Músicas repetidas: <b>${Number(user.playcount) - Number(user.track_count)}</b>`)
  textArray.push(`- Artistas conhecidos: <b>${Number(user.artist_count)}</b>`)
  textArray.push(`- Álbuns conhecidos: <b>${Number(user.album_count)}</b>`)
  textArray.push('')
  textArray.push('<b>[ℹ️] Informações</b>')
  textArray.push(`- Dentre as suas músicas ouvidas <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)}%</b> são repetidas e <b>${((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)}%</b> são novas.`)
  textArray.push(`- Em média você repete <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)}</b> vezes cada música que conhece.`)
  textArray.push('')
  if (toptracks.track.length > 0) {
    textArray.push('<b>[🎵] Músicas mais tocadas</b>')
    for (let i = 0; i < toptracks.track.length; i++) {
      const track = toptracks.track[i]
      textArray.push(`- [${i + 1}] <b><a href="${urlLimiter(track.url)}">${track.name}</a> de <a href="${urlLimiter(track.artist.url)}">${track.artist.name}</a></b>`)
      textArray.push(`  (${track.playcount} Scrobbles)`)
    }
    textArray.push('')
  }
  if (topalbums.album.length > 0) {
    textArray.push('<b>[💿] Álbuns mais tocados</b>')
    for (let i = 0; i < topalbums.album.length; i++) {
      const album = topalbums.album[i]
      textArray.push(`- [${i + 1}] <b><a href="${urlLimiter(album.url)}">${album.name}</a> de <a href="${urlLimiter(album.artist.url)}">${album.artist.name}</a></b>`)
      textArray.push(`  (${album.playcount} Scrobbles)`)
    }
    textArray.push('')
  }
  if (topartists.artist.length > 0) {
    textArray.push('<b>[👨‍🎤] Artistas mais tocados</b>')
    for (let i = 0; i < topartists.artist.length; i++) {
      const artist = topartists.artist[i]
      textArray.push(`- [${i + 1}] <b><a href="${urlLimiter(artist.url)}">${artist.name}</a></b>`)
      textArray.push(`  (${artist.playcount} Scrobbles)`)
    }
  }

  const text = textArray.join('\n')
  return text
}
