import type { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { lang } from '../../translations/base'
import type { CollageTrackData } from '../../functions/collage'

export function getCollageText (ctxLang: string | undefined, userInfo: UserInfo, collageUrl: string, topTracks: CollageTrackData[], period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month'): string {
  const textArray: string[] = []
  textArray.push(`<a href="${collageUrl}">️️</a>${lang(ctxLang, { key: 'tfCollageTittle', value: '<b>Colagem musical de <a href="{{userUrl}}">{{username}}</a></b>' }, { userUrl: userInfo.user.url, username: userInfo.user.name })}`)
  textArray.push('')
  switch (true) {
    case (period === 'overall'): {
      textArray.push(lang(ctxLang, { key: 'tfCollageTopTracksOverallHeader', value: '<b>[🎵] Mais ouvidas desde sempre:</b>' }))
      break
    }
    case (period === '7day'): {
      textArray.push(lang(ctxLang, { key: 'tfCollageTopTracks7dayHeader', value: '<b>[🎵] Mais ouvidas nos últimos 7 dias:</b>' }))
      break
    }
    case (period === '1month'): {
      textArray.push(lang(ctxLang, { key: 'tfCollageTopTracks1monthHeader', value: '<b>[🎵] Mais ouvidas no último mês:</b>' }))
      break
    }
    case (period === '3month'): {
      textArray.push(lang(ctxLang, { key: 'tfCollageTopTracks3monthHeader', value: '<b>[🎵] Mais ouvidas nos últimos 3 meses:</b>' }))
      break
    }
    case (period === '6month'): {
      textArray.push(lang(ctxLang, { key: 'tfCollageTopTracks6monthHeader', value: '<b>[🎵] Mais ouvidas nos últimos 6 meses:</b>' }))
      break
    }
    case (period === '12month'): {
      textArray.push(lang(ctxLang, { key: 'tfCollageTopTracks12monthHeader', value: '<b>[🎵] Mais ouvidas no último ano:</b>' }))
      break
    }
    default: {
      textArray.push(lang(ctxLang, { key: 'tfCollageTopTracksHeader', value: '<b>[🎵] Mais ouvidas:</b>' }))
    }
  }
  textArray.push(`- ${topTracks.map((topTrack) => { return `<a href="${topTrack.trackInfo.track.url}">${topTrack.trackInfo.track.name}</a>` }).join(' | ')}`)
  textArray.push('')
  const text = textArray.join('\n')
  return text
}
