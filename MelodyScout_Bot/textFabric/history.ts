import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { type UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { lang } from '../../translations/base'

export type TrackHistory = Array<{
  trackUrl: string
  trackName: string
  trackArtist: string
  playCount: number
}>

export function getHistoryText (ctxLang: string | undefined, userInfo: UserInfo, userRecentTracks: UserRecentTracks, trackHistory: TrackHistory, maxItens: number): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const textArray: string[] = []

  textArray.push(`<a href="${recenttracks.track[0].image[recenttracks.track[0].image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>${lang(ctxLang, { key: 'tfHistoryTitle', value: '<b>Histórico de reprodução de <a href="{{userUrl}}">{{userName}}</a></b>' }, {
    userUrl: urlLimiter(user.url),
    userName: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)
  })}`)
  textArray.push('')
  if (recenttracks.track[0]['@attr']?.nowplaying === 'true') {
    const track = recenttracks.track[0]
    textArray.push(lang(ctxLang, { key: 'tfHistoryNowPlayingHeader', value: '<b>[🎧] Ouvindo agora <a href="{{trackUrl}}">{{trackName}} de {{trackArtist}}</a></b>' }, {
      trackUrl: urlLimiter(track.url),
      trackName: sanitizeText(track.name),
      trackArtist: sanitizeText(track.artist.name)
    }))
    textArray.push('')
  }
  textArray.push(lang(ctxLang, { key: 'tfHistoryHeader', value: '<b>[📒] Histórico de reprodução</b>' }))
  if (trackHistory.length > 0) {
    for (let i = 0; i < trackHistory.length; i++) {
      const track = trackHistory[i]
      if (i >= maxItens) break
      switch (true) {
        case (track.playCount <= 1): {
          textArray.push(lang(ctxLang, { key: 'tfHistoryTrackItemSingle', value: '- <a href="{{trackUrl}}"><b>{{trackName}}</b> de <b>{{trackArtist}}</b></a>' }, {
            trackUrl: urlLimiter(track.trackUrl),
            trackName: sanitizeText(track.trackName),
            trackArtist: sanitizeText(track.trackArtist)
          }))
          break
        }
        case (track.playCount > 1): {
          textArray.push(lang(ctxLang, { key: 'tfHistoryTrackItemMultiple', value: '- ({{playCount}}x) <a href="{{trackUrl}}"><b>{{trackName}}</b> de <b>{{trackArtist}}</b></a>' }, {
            playCount: Number(track.playCount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })),
            trackUrl: urlLimiter(track.trackUrl),
            trackName: sanitizeText(track.trackName),
            trackArtist: sanitizeText(track.trackArtist)
          }))
          break
        }
      }
    }
    textArray.push('')
  }

  const text = textArray.join('\n')
  return text
}
