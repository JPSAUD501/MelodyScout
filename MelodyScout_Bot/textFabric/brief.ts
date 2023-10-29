import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { type UserTopAlbums } from '../../api/msLastfmApi/types/zodUserTopAlbums'
import { type UserTopArtists } from '../../api/msLastfmApi/types/zodUserTopArtists'
import { type UserTopTracks } from '../../api/msLastfmApi/types/zodUserTopTracks'
import { melodyScoutConfig } from '../../config'
import { type TracksTotalPlaytime } from '../../functions/getTracksTotalPlaytime'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { lang } from '../../translations/base'

export function getBriefText (ctxLang: string | undefined, userInfo: UserInfo, userTopTracks: UserTopTracks, userTopAlbums: UserTopAlbums, userTopArtists: UserTopArtists, userTotalPlaytime: TracksTotalPlaytime | undefined): string {
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

  postText.metrics.textArray.push(lang(ctxLang, { key: 'tfBriefPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' }, { username: sanitizeText(user.realname.length > 0 ? user.realname : user.name) }))
  postText.metrics.textArray.push('')
  // postText.metrics.textArray.push('[📊] Métricas')
  postText.metrics.textArray.push(lang(ctxLang, { key: 'tfBriefPostMetricsTittle', value: '[📊] Métricas' }))
  // postText.metrics.textArray.push(`- Músicas ouvidas: ${Number(user.playcount).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, { key: 'tfBriefPostMetricsTracksListened', value: '- Músicas ouvidas: {{tracksListenedLength}}' }, { tracksListenedLength: Number(user.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // postText.metrics.textArray.push(`- Músicas conhecidas: ${Number(user.track_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, { key: 'tfBriefPostMetricsTracksKnown', value: '- Músicas conhecidas: {{tracksKnownLength}}' }, { tracksKnownLength: Number(user.track_count).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // postText.metrics.textArray.push(`- Artistas conhecidos: ${Number(user.artist_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, { key: 'tfBriefPostMetricsArtistsKnown', value: '- Artistas conhecidos: {{artistsKnownLength}}' }, { artistsKnownLength: Number(user.artist_count).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // postText.metrics.textArray.push(`- Álbuns conhecidos: ${Number(user.album_count).toLocaleString('pt-BR')}`)
  postText.metrics.textArray.push(lang(ctxLang, { key: 'tfBriefPostMetricsAlbumsKnown', value: '- Álbuns conhecidos: {{albumsKnownLength}}' }, { albumsKnownLength: Number(user.album_count).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))

  // postText.infos.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.infos.textArray.push(lang(ctxLang, { key: 'tfBriefPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' }, { username: user.realname.length > 0 ? user.realname : user.name }))
  postText.infos.textArray.push('')
  // postText.infos.textArray.push('[ℹ️] Informações')
  postText.infos.textArray.push(lang(ctxLang, { key: 'tfBriefPostInfosTittle', value: '[ℹ️] Informações' }))
  if (userTotalPlaytime !== undefined && userTotalPlaytime.status === 'success') {
    const playedHours = Math.floor(userTotalPlaytime.totalPlaytime / 3600)
    const playedMinutes = Math.floor((userTotalPlaytime.totalPlaytime % 3600) / 60)
    // postText.infos.textArray.push(`- Já ouviu ${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas e ${playedMinutes} minutos de música`)
    postText.infos.textArray.push(lang(ctxLang, { key: 'tfBriefPostInfosTotalPlaytime', value: '- Já ouviu {{playedHours}} horas e {{playedMinutes}} minutos de música' }, { playedHours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), playedMinutes }))
  }
  if (((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount)) > ((Number(user.track_count) / Number(user.playcount)))) {
    // postText.infos.textArray.push(`- ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}% das músicas ouvidas são repetidas.`)
    postText.infos.textArray.push(lang(ctxLang, { key: 'tfBriefPostInfosRepeatedTracks', value: '- {{repeatedTracksPercentage}}% das músicas ouvidas são repetidas.' }, { repeatedTracksPercentage: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  }
  // postText.infos.textArray.push(`- Em média repete ${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}x cada música que conhece.`)
  postText.infos.textArray.push(lang(ctxLang, { key: 'tfBriefPostInfosAverageRepeatTracks', value: '- Em média repete {{averageRepeatTracks}}x cada música que conhece.' }, { averageRepeatTracks: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))

  // postText.mostPlayedTracks.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedTracks.textArray.push(lang(ctxLang, { key: 'tfBriefPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' }, { username: sanitizeText(user.realname.length > 0 ? user.realname : user.name) }))
  postText.mostPlayedTracks.textArray.push('')
  // postText.mostPlayedTracks.textArray.push('[🎵] Músicas mais ouvidas')
  postText.mostPlayedTracks.textArray.push(lang(ctxLang, { key: 'tfBriefPostMostPlayedTracksTittle', value: '[🎵] Músicas mais ouvidas' }))
  for (let i = 0; i < toptracks.track.length && i < 3; i++) {
    const track = toptracks.track[i]
    // postText.mostPlayedTracks.textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(track.name)} de ${sanitizeText(track.artist.name)}`)
    postText.mostPlayedTracks.textArray.push(lang(ctxLang, { key: 'tfBriefPostMostPlayedTracksListItem', value: '- ({{trackPlaycount}}x) {{trackName}} de {{trackArtistName}}' }, { trackPlaycount: Number(track.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), trackName: sanitizeText(track.name), trackArtistName: sanitizeText(track.artist.name) }))
  }

  // postText.mostPlayedAlbums.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedAlbums.textArray.push(lang(ctxLang, { key: 'tfBriefPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' }, { username: sanitizeText(user.realname.length > 0 ? user.realname : user.name) }))
  postText.mostPlayedAlbums.textArray.push('')
  // postText.mostPlayedAlbums.textArray.push('[💿] Álbuns mais ouvidos')
  postText.mostPlayedAlbums.textArray.push(lang(ctxLang, { key: 'tfBriefPostMostPlayedAlbumsTittle', value: '[💿] Álbuns mais ouvidos' }))
  for (let i = 0; i < topalbums.album.length && i < 3; i++) {
    const album = topalbums.album[i]
    // postText.mostPlayedAlbums.textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(album.name)} de ${sanitizeText(album.artist.name)}`)
    postText.mostPlayedAlbums.textArray.push(lang(ctxLang, { key: 'tfBriefPostMostPlayedAlbumsListItem', value: '- ({{albumPlaycount}}x) {{albumName}} de {{albumArtistName}}' }, { albumPlaycount: Number(album.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), albumName: sanitizeText(album.name), albumArtistName: sanitizeText(album.artist.name) }))
  }

  // postText.mostPlayedArtists.textArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postText.mostPlayedArtists.textArray.push(lang(ctxLang, { key: 'tfBriefPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' }, { username: sanitizeText(user.realname.length > 0 ? user.realname : user.name) }))
  postText.mostPlayedArtists.textArray.push('')
  // postText.mostPlayedArtists.textArray.push('[👨‍🎤] Artistas mais ouvidos')
  postText.mostPlayedArtists.textArray.push(lang(ctxLang, { key: 'tfBriefPostMostPlayedArtistsTittle', value: '[👨‍🎤] Artistas mais ouvidos' }))
  for (let i = 0; i < topartists.artist.length && i < 3; i++) {
    const artist = topartists.artist[i]
    // postText.mostPlayedArtists.textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) ${sanitizeText(artist.name)}`)
    postText.mostPlayedArtists.textArray.push(lang(ctxLang, { key: 'tfBriefPostMostPlayedArtistsListItem', value: '- ({{artistPlaycount}}x) {{artistName}}' }, { artistPlaycount: Number(artist.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), artistName: sanitizeText(artist.name) }))
  }

  const textArray: string[] = []
  // textArray.push(`<a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a><b>Resumo musical de <a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a></b>`)
  textArray.push(`<a href="${user.image[user.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>${lang(ctxLang, { key: 'tfBriefUserMusicSummaryTittle', value: '<b>Resumo musical de <a href="{{userUrl}}">{{username}}</a></b>' }, { userUrl: urlLimiter(user.url), username: sanitizeText(user.realname.length > 0 ? user.realname : user.name) })}`)
  textArray.push('')
  switch (true) {
    case (postText.metrics.postUrl().length < 300): {
      // textArray.push(`<b>[📊] Métricas</b> (<i><a href="${postText.metrics.postUrl()}">Postar 𝕏</a></i>)`)
      textArray.push(`${lang(ctxLang, { key: 'tfBriefMetricsTittle', value: '<b>[📊] Métricas</b>' })} ${lang(ctxLang, { key: 'tfBriefPostShareButton', value: '(<i><a href="{{postUrl}}">Postar 𝕏</a></i>)' }, { postUrl: postText.metrics.postUrl() })}`)
      break
    }
    default: {
      // textArray.push('<b>[📊] Métricas</b>')
      textArray.push(lang(ctxLang, { key: 'tfBriefMetricsTittle', value: '<b>[📊] Métricas</b>' }))
      break
    }
  }
  // textArray.push(`- Músicas ouvidas: <b>${Number(user.playcount).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, { key: 'tfBriefMetricsTracksListened', value: '- Músicas ouvidas: <b>{{tracksListenedLength}}</b>' }, { tracksListenedLength: Number(user.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // textArray.push(`- Músicas conhecidas: <b>${Number(user.track_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, { key: 'tfBriefMetricsTracksKnown', value: '- Músicas conhecidas: <b>{{tracksKnownLength}}</b>' }, { tracksKnownLength: Number(user.track_count).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // textArray.push(`- Músicas repetidas: <b>${(Number(user.playcount) - Number(user.track_count)).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, { key: 'tfBriefMetricsRepeatedTracks', value: '- Músicas repetidas: <b>{{repeatedTracksLength}}</b>' }, { repeatedTracksLength: (Number(user.playcount) - Number(user.track_count)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // textArray.push(`- Artistas conhecidos: <b>${Number(user.artist_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, { key: 'tfBriefMetricsArtistsKnown', value: '- Artistas conhecidos: <b>{{artistsKnownLength}}</b>' }, { artistsKnownLength: Number(user.artist_count).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // textArray.push(`- Álbuns conhecidos: <b>${Number(user.album_count).toLocaleString('pt-BR')}</b>`)
  textArray.push(lang(ctxLang, { key: 'tfBriefMetricsAlbumsKnown', value: '- Álbuns conhecidos: <b>{{albumsKnownLength}}</b>' }, { albumsKnownLength: Number(user.album_count).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  textArray.push('')
  // textArray.push(`<b>[ℹ️] Informações</b> (<i><a href="${postText.infos.postUrl()}">Postar 𝕏</a></i>)`)
  textArray.push(`${lang(ctxLang, { key: 'tfBriefInfosTittle', value: '<b>[ℹ️] Informações</b>' })} ${lang(ctxLang, { key: 'tfBriefPostShareButton', value: '(<i><a href="{{postUrl}}">Postar 𝕏</a></i>)' }, { postUrl: postText.infos.postUrl() })}`)
  if (userTotalPlaytime !== undefined) {
    switch (true) {
      default: {
        if (userTotalPlaytime.status === 'loading') {
          // textArray.push('- Carregando tempo de reprodução...')
          textArray.push(lang(ctxLang, { key: 'tfBriefInfosLoadingPlaytime', value: '- Carregando tempo de reprodução...' }))
          break
        }
        if (userTotalPlaytime.status === 'error') {
          // textArray.push('- Erro ao carregar tempo de reprodução.')
          textArray.push(lang(ctxLang, { key: 'tfBriefInfosErrorLoadingPlaytime', value: '- Erro ao carregar tempo de reprodução.' }))
          break
        }
        if (userTotalPlaytime.status === 'success') {
          const playedHours = Math.floor(userTotalPlaytime.totalPlaytime / 3600)
          const playedMinutes = Math.floor((userTotalPlaytime.totalPlaytime % 3600) / 60)
          // textArray.push(`- Você já ouviu <b>${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas</b> e <b>${playedMinutes} minutos</b> de música.`)
          textArray.push(lang(ctxLang, { key: 'tfBriefInfosTotalPlaytime', value: '- Você já ouviu <b>{{playedHours}} horas</b> e <b>{{playedMinutes}} minutos</b> de música.' }, { playedHours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), playedMinutes }))
        }
      }
    }
  }
  // textArray.push(`- Dentre as suas músicas ouvidas <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são repetidas e <b>${Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString('pt-BR')}%</b> são novas.`)
  textArray.push(lang(ctxLang, { key: 'tfBriefInfosRepeatedTracks', value: '- Dentre as suas músicas ouvidas <b>{{repeatedTracksPercentage}}%</b> são repetidas e <b>{{newTracksPercentage}}%</b> são novas.' }, { repeatedTracksPercentage: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), newTracksPercentage: Number(((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  // textArray.push(`- Em média você repete <b>${Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString('pt-BR')}</b> vezes cada música que conhece.`)
  textArray.push(lang(ctxLang, { key: 'tfBriefInfosAverageRepeatTracks', value: '- Em média você repete <b>{{averageRepeatTracks}}</b> vezes cada música que conhece.' }, { averageRepeatTracks: Number(((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  textArray.push('')
  if (toptracks.track.length > 0) {
    switch (true) {
      case (postText.mostPlayedTracks.postUrl().length < 300): {
        // textArray.push(`<b>[🎵] Músicas mais tocadas</b> (<i><a href="${postText.mostPlayedTracks.postUrl()}">Postar 𝕏</a></i>)`)
        textArray.push(`${lang(ctxLang, { key: 'tfBriefMostPlayedTracksTittle', value: '<b>[🎵] Músicas mais tocadas</b>' })} ${lang(ctxLang, { key: 'tfBriefPostShareButton', value: '(<i><a href="{{postUrl}}">Postar 𝕏</a></i>)' }, { postUrl: postText.mostPlayedTracks.postUrl() })}`)
        break
      }
      default: {
        // textArray.push('<b>[🎵] Músicas mais tocadas</b>')
        textArray.push(lang(ctxLang, { key: 'tfBriefMostPlayedTracksTittle', value: '<b>[🎵] Músicas mais tocadas</b>' }))
        break
      }
    }
    for (let i = 0; i < toptracks.track.length; i++) {
      const track = toptracks.track[i]
      // textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}"><b>${sanitizeText(track.name)}</b> de <b>${sanitizeText(track.artist.name)}</b></a>`)
      textArray.push(lang(ctxLang, { key: 'tfBriefMostPlayedTracksListItem', value: '- ({{trackPlaycount}}x) <a href="{{trackUrl}}"><b>{{trackName}}</b> de <b>{{trackArtistName}}</b></a>' }, { trackPlaycount: Number(track.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), trackUrl: urlLimiter(track.url), trackName: sanitizeText(track.name), trackArtistName: sanitizeText(track.artist.name) }))
    }
    textArray.push('')
  }
  if (topalbums.album.length > 0) {
    switch (true) {
      case (postText.mostPlayedAlbums.postUrl().length < 300): {
        // textArray.push(`<b>[💿] Álbuns mais tocados</b> (<i><a href="${postText.mostPlayedAlbums.postUrl()}">Postar 𝕏</a></i>)`)
        textArray.push(`${lang(ctxLang, { key: 'tfBriefMostPlayedAlbumsTittle', value: '<b>[💿] Álbuns mais tocados</b>' })} ${lang(ctxLang, { key: 'tfBriefPostShareButton', value: '(<i><a href="{{postUrl}}">Postar 𝕏</a></i>)' }, { postUrl: postText.mostPlayedAlbums.postUrl() })}`)
        break
      }
      default: {
        // textArray.push('<b>[💿] Álbuns mais tocados</b>')
        textArray.push(lang(ctxLang, { key: 'tfBriefMostPlayedAlbumsTittle', value: '<b>[💿] Álbuns mais tocados</b>' }))
        break
      }
    }
    for (let i = 0; i < topalbums.album.length; i++) {
      const album = topalbums.album[i]
      // textArray.push(`- (${Number(album.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(album.url)}"><b>${sanitizeText(album.name)}</b> de <b>${sanitizeText(album.artist.name)}</b></a>`)
      textArray.push(lang(ctxLang, { key: 'tfBriefMostPlayedAlbumsListItem', value: '- ({{albumPlaycount}}x) <a href="{{albumUrl}}"><b>{{albumName}}</b> de <b>{{albumArtistName}}</b></a>' }, { albumPlaycount: Number(album.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), albumUrl: urlLimiter(album.url), albumName: sanitizeText(album.name), albumArtistName: sanitizeText(album.artist.name) }))
    }
    textArray.push('')
  }
  if (topartists.artist.length > 0) {
    switch (true) {
      case (postText.mostPlayedArtists.postUrl().length < 300): {
        // textArray.push(`<b>[👨‍🎤] Artistas mais tocados</b> (<i><a href="${postText.mostPlayedArtists.postUrl()}">Postar 𝕏</a></i>)`)
        textArray.push(`${lang(ctxLang, { key: 'tfBriefMostPlayedArtistsTittle', value: '<b>[👨‍🎤] Artistas mais tocados</b>' })} ${lang(ctxLang, { key: 'tfBriefPostShareButton', value: '(<i><a href="{{postUrl}}">Postar 𝕏</a></i>)' }, { postUrl: postText.mostPlayedArtists.postUrl() })}`)
        break
      }
      default: {
        // textArray.push('<b>[👨‍🎤] Artistas mais tocados</b>')
        textArray.push(lang(ctxLang, { key: 'tfBriefMostPlayedArtistsTittle', value: '<b>[👨‍🎤] Artistas mais tocados</b>' }))
        break
      }
    }
    for (let i = 0; i < topartists.artist.length; i++) {
      const artist = topartists.artist[i]
      // textArray.push(`- (${Number(artist.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(artist.url)}"><b>${sanitizeText(artist.name)}</b></a>`)
      textArray.push(lang(ctxLang, { key: 'tfBriefMostPlayedArtistsListItem', value: '- ({{artistPlaycount}}x) <a href="{{artistUrl}}"><b>{{artistName}}</b></a>' }, { artistPlaycount: Number(artist.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })), artistUrl: urlLimiter(artist.url), artistName: sanitizeText(artist.name) }))
    }
  }

  const text = textArray.join('\n')
  return text
}
