import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { type UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { lang } from '../../translations/base'

export function getHistoryText (ctxLang: string | undefined, userInfo: UserInfo, userRecentTracks: UserRecentTracks): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const textArray: string[] = []

  // textArray.push(`<b><a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>Histórico de reprodução de <a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push(`<b><a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>${lang(ctxLang, { key: 'tfHistoryTitle', value: '<b>Histórico de reprodução de <a href="{{userUrl}}">{{userName}}</a></b>' }, {
    userUrl: urlLimiter(user.url),
    userName: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)
  })}`)
  textArray.push('')
  if (recenttracks.track[0]['@attr']?.nowplaying === 'true') {
    const track = recenttracks.track[0]
    // textArray.push(`<b>[🎧] Ouvindo agora <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)} de ${sanitizeText(track.artist.name)}</a></b>`)
    textArray.push(lang(ctxLang, { key: 'tfHistoryNowPlayingHeader', value: '<b>[🎧] Ouvindo agora <a href="{{trackUrl}}">{{trackName}} de {{trackArtist}}</a></b>' }, {
      trackUrl: urlLimiter(track.url),
      trackName: sanitizeText(track.name),
      trackArtist: sanitizeText(track.artist.name)
    }))
    textArray.push('')
  }
  // textArray.push('<b>[📒] Histórico de reprodução</b>')
  textArray.push(lang(ctxLang, { key: 'tfHistoryHeader', value: '<b>[📒] Histórico de reprodução</b>' }))
  if (recenttracks.track.length > 0) {
    for (let i = 0; i < recenttracks.track.length; i++) {
      const track = recenttracks.track[i]
      if (track['@attr']?.nowplaying === 'true') continue
      // textArray.push(`- <a href="${urlLimiter(track.url)}"><b>${sanitizeText(track.name)}</b> de <b>${sanitizeText(track.artist.name)}</b></a>`)
      textArray.push(lang(ctxLang, { key: 'tfHistoryTrack', value: '- <a href="{{trackUrl}}"><b>{{trackName}}</b> de <b>{{trackArtist}}</b></a>' }, {
        trackUrl: urlLimiter(track.url),
        trackName: sanitizeText(track.name),
        trackArtist: sanitizeText(track.artist.name)
      }))
    }
    textArray.push('')
  }

  const text = textArray.join('\n')
  return text
}
