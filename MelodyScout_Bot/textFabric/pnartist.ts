import { type Artist } from '@soundify/web-api'
import { type ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { type TracksTotalPlaytime } from '../../functions/getTracksTotalPlaytime'
import { type UserFilteredTopTracks } from '../../functions/getUserFilteredTopTracks'
import { lang } from '../../translations/base'

export function getPnartistText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, userArtistTopTracks: UserFilteredTopTracks, userArtistTotalPlaytime: TracksTotalPlaytime, spotifyArtistInfo: Artist, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo

  const postTextArray: string[] = []
  // postTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postTextArray.push(lang(ctxLang, { key: 'tfPnartistPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' }, { username: user.realname.length > 0 ? user.realname : user.name }))
  postTextArray.push('')
  // postTextArray.push('[🎧] Sobre o artista')
  postTextArray.push(lang(ctxLang, { key: 'tfPnartistPostAboutArtistHeader', value: '[🎧] Sobre o artista' }))
  // postTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)
  postTextArray.push(lang(ctxLang, { key: 'tfPnartistPostAboutArtistArtist', value: '- Artista: {{artist}}' }, { artist: sanitizeText(artist.name) }))
  postTextArray.push('')
  // postTextArray.push(`[📊] ${Number(artist.stats.userplaycount).toLocaleString('pt-BR')} Scrobbles`)
  postTextArray.push(lang(ctxLang, { key: 'tfPnartistPostScrobbles', value: '[📊] {{artistScrobbles}} Scrobbles' }, { artistScrobbles: Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  const postInfoArray: string[] = []
  if (userArtistTotalPlaytime.status === 'success') {
    const playedHours = Math.floor(userArtistTotalPlaytime.totalPlaytime / 3600)
    const playedMinutes = Math.floor((userArtistTotalPlaytime.totalPlaytime % 3600) / 60)
    // postInfoArray.push(`- Já ouviu esse artista por ${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas e ${playedMinutes} minutos`)
    postInfoArray.push(lang(ctxLang, { key: 'tfPnartistPostArtistTotalPlaytime', value: '- Já ouviu esse artista por {{artistTotalPlaytimeHours}} horas e {{artistTotalPlaytimeMinutes}} minutos' }, {
      artistTotalPlaytimeHours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })),
      artistTotalPlaytimeMinutes: playedMinutes
    }))
  }
  // if (spotifyArtistInfo.popularity !== undefined) postInfoArray.push(`A popularidade atual desse artista é: [${spotifyArtistInfo.popularity}][${'★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))}]`)
  if (spotifyArtistInfo.popularity !== undefined) {
    postInfoArray.push(lang(ctxLang, { key: 'tfPnartistPostArtistPopularity', value: '- A popularidade atual desse artista é: [{{artistPopularity}}][{{artistPopularityStars}}]' }, {
      artistPopularity: spotifyArtistInfo.popularity,
      artistPopularityStars: '★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))
    }))
  }
  switch (postInfoArray.length) {
    case 0: {
      break
    }
    case 1: {
      postTextArray.push('')
      // postTextArray.push(`[ℹ️] ${postInfoArray[0]}`)
      postTextArray.push(lang(ctxLang, { key: 'tfPnartistPostOneInfo', value: '[ℹ️] {{info}}' }, { info: postInfoArray[0] }))
      break
    }
    default: {
      postTextArray.push('')
      // postTextArray.push('[ℹ️] Informações')
      postTextArray.push(lang(ctxLang, { key: 'tfPnartistPostInfoHeader', value: '[ℹ️] Informações' }))
      postInfoArray.forEach((info) => {
        postTextArray.push(`${info}`)
      })
      break
    }
  }
  postTextArray.push('')
  postTextArray.push(`${spotifyArtistInfo.external_urls.spotify}`)
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  // textArray.push(`<a href="${spotifyArtistInfo.images?.[0]?.url ?? ''}">️️</a><a href="${artist.image[artist.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a><b><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}</b>`)
  switch (nowPlaying) {
    case true:
      textArray.push(`<a href="${spotifyArtistInfo.images?.[0]?.url ?? ''}">️️</a><a href="${artist.image[artist.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPnartistHeaderNowPlaying', value: '<b><a href="{{userUrl}}">{{username}}</a> está ouvindo</b>' }, { userUrl: urlLimiter(user.url), username: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
    case false:
      textArray.push(`<a href="${spotifyArtistInfo.images?.[0]?.url ?? ''}">️️</a><a href="${artist.image[artist.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.userImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPnartistHeaderLastPlayed', value: '<b><a href="{{userUrl}}">{{username}}</a> estava ouvindo</b>' }, { userUrl: urlLimiter(user.url), username: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
  }
  textArray.push('')
  switch (nowPlaying) {
    case true:
      // textArray.push('<b>[🎧] Ouvindo o artista</b>')
      textArray.push(lang(ctxLang, { key: 'tfPnartistHeaderNowPlayingArtist', value: '<b>[🎧] Ouvindo o artista</b>' }))
      break
    case false:
      // textArray.push('<b>[🎧] Último artista ouvido</b>')
      textArray.push(lang(ctxLang, { key: 'tfPnartistHeaderLastPlayedArtist', value: '<b>[🎧] Último artista ouvido</b>' }))
      break
  }
  // textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfPnartistArtistName', value: '- Artista: <b><a href="{{artistUrl}}">{{artistName}}</a></b>' }, { artistUrl: urlLimiter(artist.url), artistName: sanitizeText(artist.name) }))
  const infoArray: string[] = []
  switch (true) {
    default: {
      if (userArtistTotalPlaytime.status === 'loading') {
        // infoArray.push('- Carregando tempo de reprodução...')
        infoArray.push(lang(ctxLang, { key: 'tfPnartistInfoLoadingTotalPlaytime', value: '- Carregando tempo de reprodução...' }))
        break
      }
      if (userArtistTotalPlaytime.status === 'error') {
        // infoArray.push('- Erro ao carregar tempo de reprodução.')
        infoArray.push(lang(ctxLang, { key: 'tfPnartistInfoErrorLoadingTotalPlaytime', value: '- Erro ao carregar tempo de reprodução.' }))
        break
      }
      if (userArtistTotalPlaytime.status === 'success') {
        const playedHours = Math.floor(userArtistTotalPlaytime.totalPlaytime / 3600)
        const playedMinutes = Math.floor((userArtistTotalPlaytime.totalPlaytime % 3600) / 60)
        // infoArray.push(`- Você já ouviu esse artista por <b>${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas</b> e <b>${playedMinutes} minutos</b>.`)
        infoArray.push(lang(ctxLang, { key: 'tfPnartistInfoTotalPlaytime', value: '- Você já ouviu esse artista por <b>{{artistTotalPlaytimeHours}} horas</b> e <b>{{artistTotalPlaytimeMinutes}} minutos</b>.' }, {
          artistTotalPlaytimeHours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })),
          artistTotalPlaytimeMinutes: playedMinutes
        }))
      }
    }
  }
  // if (spotifyArtistInfo.popularity !== undefined) infoArray.push(`- A <a href="${melodyScoutConfig.popularityImgUrl}">popularidade</a> atual desse artista é: <b>[${spotifyArtistInfo.popularity}][${'★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))}]</b>`)
  if (spotifyArtistInfo.popularity !== undefined) {
    infoArray.push(lang(ctxLang, { key: 'tfPnartistInfoPopularity', value: '- A <a href="{{popularityHelpImgUrl}}">popularidade</a> atual desse artista é: <b>[{{artistPopularity}}][{{artistPopularityStars}}]</b>' }, {
      popularityHelpImgUrl: melodyScoutConfig.popularityImgUrl,
      artistPopularity: spotifyArtistInfo.popularity,
      artistPopularityStars: '★'.repeat(Math.floor(spotifyArtistInfo.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyArtistInfo.popularity / 20))
    }))
  }
  if (infoArray.length > 0) {
    textArray.push('')
    // textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(lang(ctxLang, { key: 'tfPnartistInfoHeader', value: '<b>[ℹ️] Informações</b>' }))
    textArray.push(...infoArray)
  }
  textArray.push('')
  // textArray.push(`<b>[📊] ${Number(artist.stats.userplaycount).toLocaleString('pt-BR')} Scrobbles</b>`)
  textArray.push(lang(ctxLang, { key: 'tfPnartistScrobbles', value: '<b>[📊] {{artistScrobbles}} Scrobbles</b>' }, { artistScrobbles: Number(artist.stats.userplaycount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })) }))
  textArray.push('')
  // textArray.push('<b>[🎶] As suas mais ouvidas</b>')
  textArray.push(lang(ctxLang, { key: 'tfPnartistTopTracksHeader', value: '<b>[🎶] As suas mais ouvidas</b>' }))
  switch (true) {
    default: {
      if (userArtistTopTracks.status === 'loading') {
        // textArray.push('- Carregando...')
        textArray.push(lang(ctxLang, { key: 'tfPnartistLoadingTopTracks', value: '- Carregando...' }))
        break
      }
      if (userArtistTopTracks.status === 'error') {
        // textArray.push('- Erro ao carregar musicas.')
        textArray.push(lang(ctxLang, { key: 'tfPnartistErrorLoadingTopTracks', value: '- Erro ao carregar musicas.' }))
      }
      if (userArtistTopTracks.status === 'success') {
        if (userArtistTopTracks.data.length <= 0) {
          // textArray.push('- Nenhuma musica encontrada.')
          textArray.push(lang(ctxLang, { key: 'tfPnartistNoTopTracks', value: '- Nenhuma música encontrada.' }))
          break
        }
        for (let i = 0; i < userArtistTopTracks.data.length && i < 10; i++) {
          const track = userArtistTopTracks.data[i]
          // textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a>`)
          textArray.push(lang(ctxLang, { key: 'tfPnartistTopTracks', value: '- ({{trackPlaycount}}x) <a href="{{trackUrl}}">{{trackName}}</a>' }, {
            trackPlaycount: Number(track.playcount).toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })),
            trackUrl: urlLimiter(track.url),
            trackName: sanitizeText(track.name)
          }))
        }
      }
    }
  }
  textArray.push('')
  // textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(lang(ctxLang, { key: 'tfPnartistShareHeader', value: '<b>[🔗] Compartilhe</b>' }))
  // textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)
  textArray.push(lang(ctxLang, { key: 'tfPnartistShareOnX', value: '- <a href="{{postUrl}}">Compartilhar no 𝕏!</a>' }, { postUrl }))

  const text = textArray.join('\n')
  return text
}
