import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'
import config from '../../config'
import { sanitizeText } from '../../function/sanitizeText'

export function getHistoryText (userInfo: UserInfo, userRecentTracks: UserRecentTracks): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const textArray: string[] = []

  textArray.push(`<b><a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a><a href="${config.melodyScout.userImgUrl}">️️</a>Histórico de reprodução de <a href="${user.url}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push('')
  if (recenttracks.track[0]['@attr']?.nowplaying === 'true') {
    const track = recenttracks.track[0]
    textArray.push(`<b>[🎧] Ouvindo agora <a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a></b>`)
    textArray.push('')
  }
  textArray.push('<b>[📒] Histórico de reprodução</b>')
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
