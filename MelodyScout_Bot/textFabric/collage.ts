import type { AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import type { TrackInfo } from '../../api/msLastfmApi/types/zodTrackInfo'
import type { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { lang } from '../../translations/base'

export function getCollageText (ctxLang: string | undefined, userInfo: UserInfo, collageUrl: string, topTracks: Array<{
  trackInfo: TrackInfo
  albumInfo: AlbumInfo
}>): string {
  const textArray: string[] = []
  textArray.push(`<a href="${collageUrl}">️️</a>${lang(ctxLang, { key: 'tfCollageTittle', value: '<b>Colagem musical de <a href="{{userUrl}}">{{username}}</a></b>' }, { userUrl: userInfo.user.url, username: userInfo.user.name })}`)
  textArray.push('')
  textArray.push(lang(ctxLang, { key: 'tfCollageTopTracksHeader', value: '<b>[🎵] Músicas mais ouvidas:</b>' }))
  textArray.push(`- ${topTracks.map((topTrack) => { return `<a href="${topTrack.trackInfo.track.url}">${topTrack.trackInfo.track.name}</a>` }).join(' | ')}`)
  textArray.push('')
  const text = textArray.join('\n')
  return text
}
