import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserTopAlbums } from '../../api/msLastfmApi/types/zodUserTopAlbums'
import { UserTopArtists } from '../../api/msLastfmApi/types/zodUserTopArtists'
import { UserTopTracks } from '../../api/msLastfmApi/types/zodUserTopTracks'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { urlLimiter } from '../../function/urlLimiter'
import { lang } from '../../translations/base'

export function getBriefText (ctxLang: string | undefined, userInfo: UserInfo, userTopTracks: UserTopTracks, userTopAlbums: UserTopAlbums, userTopArtists: UserTopArtists): string {
  const { user } = userInfo
  const { toptracks } = userTopTracks
  const { topalbums } = userTopAlbums
  const { topartists } = userTopArtists

  const postText: {
    metrics: {
      textArray: string[]
      postUrl: () => string
    }
    infos: {
      textArray: string[]
      postUrl: () => string
    }
    mostPlayedTracks: {
      textArray: string[]
      postUrl: () => string
    }
    mostPlayedAlbums: {
      textArray: string[]
      postUrl: () => string
    }
    mostPlayedArtists: {
      textArray: string[]
      postUrl: () => string
    }
  } = {
    metrics: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.metrics.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    infos: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.infos.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedTracks: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.mostPlayedTracks.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedAlbums: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.mostPlayedAlbums.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    },
    mostPlayedArtists: {
      textArray: [],
      postUrl: () => {
        return `https://x.com/intent/tweet?text=${postText.mostPlayedArtists.textArray.map((text) => encodeURIComponent(text)).join('%0A')}`
      }
    }
  }

  postText.metrics.textArray.push(lang(ctxLang, 'tfBriefPostUserAtMelodyScoutBot', { username: user.realname.length > 0 ? user.realname : user.name }))
  postText.metrics.textArray.push('')
  // postText.metrics.textArray.push('[📊] Métricas')
  postText.metrics.textArray.push(lang(ctxLang, 'tfBriefPostMetricsTittle'))
  // postText.metrics.textArray.push(`- Músicas ouvidas: ${Number(user.playcount).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, 'tfBriefPostMetricsTracksListened', { tracksListenedLength: Number(user.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // postText.metrics.textArray.push(`- Músicas conhecidas: ${Number(user.track_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, 'tfBriefPostMetricsTracksKnown', { tracksKnownLength: Number(user.track_count).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // postText.metrics.textArray.push(`- Artistas conhecidos: ${Number(user.artist_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, 'tfBriefPostMetricsArtistsKnown', { artistsKnownLength: Number(user.artist_count).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // postText.metrics.textArray.push(`- Álbuns conhecidos: ${Number(user.album_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, 'tfBriefPostMetricsAlbumsKnown', { albumsKnownLength: Number(user.album_count).toLocaleString(lang(ctxLang, 'localeLangCode')) }))

  // postText.infos.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.infos.textArray.push(lang(ctxLang, 'tfBriefPostUserAtMelodyScoutBot', { username: user.realname.length > 0 ? user.realname : user.name }))
  postText.infos.textArray.push('')
  // postText.infos.textArray.push('[ℹ️] Informações')
  postText.infos.textArray.push(lang(ctxLang, 'tfBriefPostInfosTittle'))
  if (((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount)) > ((Number(user.track_count) / Number(user.playcount)))) {
    // postText.infos.textArray.push(`- ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}% das músicas ouvidas são repetidas.`)
    postText.infos.textArray.push(lang(ctxLang, 'tfBriefPostInfosRepeatedTracks', { repeatedTracksPercentage: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  }
  // postText.infos.textArray.push(`- Em média repete ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}x cada música que conhece.`)
  postText.infos.textArray.push(lang(ctxLang, 'tfBriefPostInfosAverageRepeatTracks', { averageRepeatTracks: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))

  // postText.mostPlayedTracks.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedTracks.textArray.push(lang(ctxLang, 'tfBriefPostUserAtMelodyScoutBot', { username: user.realname.length > 0 ? user.realname : user.name }))
  postText.mostPlayedTracks.textArray.push('')
  // postText.mostPlayedTracks.textArray.push('[🎵] Músicas mais ouvidas')
  postText.mostPlayedTracks.textArray.push(lang(ctxLang, 'tfBriefPostMostPlayedTracksTittle'))
  for (let i = 0; i < toptracks.track.length && i < 3; i++) {
    const track = toptracks.track[i]
    // postText.mostPlayedTracks.textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(track.name)} de ${sanitizeText(track.artist.name)}`)
    postText.mostPlayedTracks.textArray.push(lang(ctxLang, 'tfBriefPostMostPlayedTracksListItem', { trackPlaycount: Number(track.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')), trackName: sanitizeText(track.name), trackArtistName: sanitizeText(track.artist.name) }))
  }

  // postText.mostPlayedAlbums.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedAlbums.textArray.push(lang(ctxLang, 'tfBriefPostUserAtMelodyScoutBot', { username: user.realname.length > 0 ? user.realname : user.name }))
  postText.mostPlayedAlbums.textArray.push('')
  // postText.mostPlayedAlbums.textArray.push('[💿] Álbuns mais ouvidos')
  postText.mostPlayedAlbums.textArray.push(lang(ctxLang, 'tfBriefPostMostPlayedAlbumsTittle'))
  for (let i = 0; i < topalbums.album.length && i < 3; i++) {
    const album = topalbums.album[i]
    // postText.mostPlayedAlbums.textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(album.name)} de ${sanitizeText(album.artist.name)}`)
    postText.mostPlayedAlbums.textArray.push(lang(ctxLang, 'tfBriefPostMostPlayedAlbumsListItem', { albumPlaycount: Number(album.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')), albumName: sanitizeText(album.name), albumArtistName: sanitizeText(album.artist.name) }))
  }

  // postText.mostPlayedArtists.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedArtists.textArray.push(lang(ctxLang, 'tfBriefPostUserAtMelodyScoutBot', { username: user.realname.length > 0 ? user.realname : user.name }))
  postText.mostPlayedArtists.textArray.push('')
  // postText.mostPlayedArtists.textArray.push('[👨‍🎤] Artistas mais ouvidos')
  postText.mostPlayedArtists.textArray.push(lang(ctxLang, 'tfBriefPostMostPlayedArtistsTittle'))
  for (let i = 0; i < topartists.artist.length && i < 3; i++) {
    const artist = topartists.artist[i]
    // postText.mostPlayedArtists.textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(artist.name)}`)
    postText.mostPlayedArtists.textArray.push(lang(ctxLang, 'tfBriefPostMostPlayedArtistsListItem', { artistPlaycount: Number(artist.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')), artistName: sanitizeText(artist.name) }))
  }

  const textArray: string[] = []
  // textArray.push(`<a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a><b>Resumo musical de <a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push(`<a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>${lang(ctxLang, 'tfBriefUserMusicSummaryTittle', { userUrl: urlLimiter(user.url), username: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
  textArray.push('')
  switch (true) {
    case (postText.metrics.postUrl().length < 300): {
      // textArray.push(`<b>[📊] Métricas</b> (<i><a href="${postText.metrics.postUrl()}">Postar 𝕏</a></i>)`)
      textArray.push(`${lang(ctxLang, 'tfBriefMetricsTittle')} ${lang(ctxLang, 'tfBriefPostShareButton', { postUrl: postText.metrics.postUrl() })}`)
      break
    }
    default: {
      // textArray.push('<b>[📊] Métricas</b>')
      textArray.push(lang(ctxLang, 'tfBriefMetricsTittle'))
      break
    }
  }
  // textArray.push(`- Músicas ouvidas: <b>${Number(user.playcount).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, 'tfBriefMetricsTracksListened', { tracksListenedLength: Number(user.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // textArray.push(`- Músicas conhecidas: <b>${Number(user.track_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, 'tfBriefMetricsTracksKnown', { tracksKnownLength: Number(user.track_count).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // textArray.push(`- Músicas repetidas: <b>${(Number(user.playcount) - Number(user.track_count)).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, 'tfBriefMetricsRepeatedTracks', { repeatedTracksLength: (Number(user.playcount) - Number(user.track_count)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // textArray.push(`- Artistas conhecidos: <b>${Number(user.artist_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, 'tfBriefMetricsArtistsKnown', { artistsKnownLength: Number(user.artist_count).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // textArray.push(`- Álbuns conhecidos: <b>${Number(user.album_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, 'tfBriefMetricsAlbumsKnown', { albumsKnownLength: Number(user.album_count).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  textArray.push('')
  // textArray.push(`<b>[ℹ️] Informações</b> (<i><a href="${postText.infos.postUrl()}">Postar 𝕏</a></i>)`)
  textArray.push(`${lang(ctxLang, 'tfBriefInfosTittle')} ${lang(ctxLang, 'tfBriefPostShareButton', { postUrl: postText.infos.postUrl() })}`)
  // textArray.push(`- Dentre as suas músicas ouvidas <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são repetidas e <b>${Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são novas.`)
  textArray.push(lang(ctxLang, 'tfBriefInfosRepeatedTracks', { repeatedTracksPercentage: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString(lang(ctxLang, 'localeLangCode')), newTracksPercentage: Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  // textArray.push(`- Em média você repete <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}</b> vezes cada música que conhece.`)
  textArray.push(lang(ctxLang, 'tfBriefInfosAverageRepeatTracks', { averageRepeatTracks: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString(lang(ctxLang, 'localeLangCode')) }))
  textArray.push('')
  if (toptracks.track.length > 0) {
    switch (true) {
      case (postText.mostPlayedTracks.postUrl().length < 300): {
        // textArray.push(`<b>[🎵] Músicas mais tocadas</b> (<i><a href="${postText.mostPlayedTracks.postUrl()}">Postar 𝕏</a></i>)`)
        textArray.push(`${lang(ctxLang, 'tfBriefMostPlayedTracksTittle')} ${lang(ctxLang, 'tfBriefPostShareButton', { postUrl: postText.mostPlayedTracks.postUrl() })}`)
        break
      }
      default: {
        // textArray.push('<b>[🎵] Músicas mais tocadas</b>')
        textArray.push(lang(ctxLang, 'tfBriefMostPlayedTracksTittle'))
        break
      }
    }
    for (let i = 0; i < toptracks.track.length; i++) {
      const track = toptracks.track[i]
      // textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}"><b>${sanitizeText(track.name)}</b> de <b>${sanitizeText(track.artist.name)}</b></a>`)
      textArray.push(lang(ctxLang, 'tfBriefMostPlayedTracksListItem', { trackPlaycount: Number(track.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')), trackUrl: urlLimiter(track.url), trackName: sanitizeText(track.name), trackArtistName: sanitizeText(track.artist.name) }))
    }
    textArray.push('')
  }
  if (topalbums.album.length > 0) {
    switch (true) {
      case (postText.mostPlayedAlbums.postUrl().length < 300): {
        // textArray.push(`<b>[💿] Álbuns mais tocados</b> (<i><a href="${postText.mostPlayedAlbums.postUrl()}">Postar 𝕏</a></i>)`)
        textArray.push(`${lang(ctxLang, 'tfBriefMostPlayedAlbumsTittle')} ${lang(ctxLang, 'tfBriefPostShareButton', { postUrl: postText.mostPlayedAlbums.postUrl() })}`)
        break
      }
      default: {
        // textArray.push('<b>[💿] Álbuns mais tocados</b>')
        textArray.push(lang(ctxLang, 'tfBriefMostPlayedAlbumsTittle'))
        break
      }
    }
    for (let i = 0; i < topalbums.album.length; i++) {
      const album = topalbums.album[i]
      // textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(album.url)}"><b>${sanitizeText(album.name)}</b> de <b>${sanitizeText(album.artist.name)}</b></a>`)
      textArray.push(lang(ctxLang, 'tfBriefMostPlayedAlbumsListItem', { albumPlaycount: Number(album.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')), albumUrl: urlLimiter(album.url), albumName: sanitizeText(album.name), albumArtistName: sanitizeText(album.artist.name) }))
    }
    textArray.push('')
  }
  if (topartists.artist.length > 0) {
    switch (true) {
      case (postText.mostPlayedArtists.postUrl().length < 300): {
        // textArray.push(`<b>[👨‍🎤] Artistas mais tocados</b> (<i><a href="${postText.mostPlayedArtists.postUrl()}">Postar 𝕏</a></i>)`)
        textArray.push(`${lang(ctxLang, 'tfBriefMostPlayedArtistsTittle')} ${lang(ctxLang, 'tfBriefPostShareButton', { postUrl: postText.mostPlayedArtists.postUrl() })}`)
        break
      }
      default: {
        // textArray.push('<b>[👨‍🎤] Artistas mais tocados</b>')
        textArray.push(lang(ctxLang, 'tfBriefMostPlayedArtistsTittle'))
        break
      }
    }
    for (let i = 0; i < topartists.artist.length; i++) {
      const artist = topartists.artist[i]
      // textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(artist.url)}"><b>${sanitizeText(artist.name)}</b></a>`)
      textArray.push(lang(ctxLang, 'tfBriefMostPlayedArtistsListItem', { artistPlaycount: Number(artist.playcount).toLocaleString(lang(ctxLang, 'localeLangCode')), artistUrl: urlLimiter(artist.url), artistName: sanitizeText(artist.name) }))
    }
  }

  const text = textArray.join('\n')
  return text
}
