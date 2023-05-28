import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'

export function getHistoryText (userInfo: UserInfo, userRecentTracks: UserRecentTracks): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const textArray: string[] = []

  textArray.push(`<b><a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>Histórico de reprodução de <a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push('')
  if (recenttracks.track[0]['@attr']?.nowplaying === 'true') {
    const track = recenttracks.track[0]
    textArray.push(`<b>[🎧] Ouvindo agora <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)} de ${sanitizeText(track.artist.name)}</a></b>`)
    textArray.push('')
  }
  textArray.push('<b>[📒] Histórico de reprodução</b>')
  if (recenttracks.track.length > 0) {
    for (let i = 0; i < recenttracks.track.length; i++) {
      const track = recenttracks.track[i]
      if (track['@attr']?.nowplaying === 'true') continue
      textArray.push(`- <a href="${urlLimiter(track.url)}"><b>${sanitizeText(track.name)}</b> de <b>${sanitizeText(track.artist.name)}</b></a>`)
    }
    textArray.push('')
  }

  const text = textArray.join('\n')
  return text
}
