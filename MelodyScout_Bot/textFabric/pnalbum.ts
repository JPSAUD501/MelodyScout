import { type AlbumSimplified } from '@soundify/web-api'
import { type AlbumInfo } from '../../api/msLastfmApi/types/zodAlbumInfo'
import { type ArtistInfo } from '../../api/msLastfmApi/types/zodArtistInfo'
import { type UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { type TracksTotalPlaytime } from '../../functions/getTracksTotalPlaytime'
import { type UserFilteredTopTracks } from '../../functions/getUserFilteredTopTracks'
import { lang } from '../../translations/base'

export function getPnalbumText (ctxLang: string | undefined, userInfo: UserInfo, artistInfo: ArtistInfo, albumInfo: AlbumInfo, userAlbumTopTracks: UserFilteredTopTracks, userAlbumTotalPlaytime: TracksTotalPlaytime, spotifyAlbumInfo: AlbumSimplified, nowPlaying: boolean): string {
  const { user } = userInfo
  const { artist } = artistInfo
  const { album } = albumInfo

  const postTextArray: string[] = []
  postTextArray.push(`${user.realname.length > 0 ? user.realname : user.name} no @MelodyScoutBot`)
  postTextArray.push('')
  // postTextArray.push('[🎧] Sobre o album')
  postTextArray.push(lang(ctxLang, { key: 'tfPnalbumPostHeader', value: '[🎧] Sobre o album' }))
  // postTextArray.push(`- Álbum: ${sanitizeText(album.name)}`)
  postTextArray.push(lang(ctxLang, { key: 'tfPnalbumPostAlbumName', value: '- Álbum: {{albumName}}' }, { albumName: sanitizeText(album.name) }))
  // postTextArray.push(`- Artista: ${sanitizeText(artist.name)}`)

  postTextArray.push('')
  // postTextArray.push(`[📊] ${(album.userplaycount ?? 0).toLocaleString('pt-BR')} Scrobbles`)
  postTextArray.push(lang(ctxLang, { key: 'tfPnalbumPostScrobblesHeader', value: '[📊] {{albumScrobbles}} Scrobbles' }, { albumScrobbles: (album.userplaycount ?? 0).toLocaleString('pt-BR') }))
  const postInfoArray: string[] = []
  if (userAlbumTotalPlaytime.status === 'success') {
    const playedHours = Math.floor(userAlbumTotalPlaytime.totalPlaytime / 3600)
    const playedMinutes = Math.floor((userAlbumTotalPlaytime.totalPlaytime % 3600) / 60)
    // postInfoArray.push(`Já ouviu esse album por <b>${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas</b> e <b>${playedMinutes} minutos</b>`)
    postInfoArray.push(lang(ctxLang, { key: 'tfPnalbumPostInfoTotalPlaytime', value: '- Já ouviu esse album por <b>{{playedHours}} horas</b> e <b>{{playedMinutes}} minutos</b>' }, {
      playedHours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })),
      playedMinutes
    }))
  }
  if (spotifyAlbumInfo.popularity !== undefined) {
    // postInfoArray.push(`A popularidade atual desse album é: [${spotifyAlbumInfo.popularity}][${'★'.repeat(Math.floor(spotifyAlbumInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyAlbumInfo.popularity / 20))}]`)
    postInfoArray.push(lang(ctxLang, { key: 'tfPnalbumPostInfoPopularity', value: '- A popularidade atual desse album é: [{{spotifyAlbumPopularity}}][{{spotifyAlbumPopularityStars}}]' }, {
      spotifyAlbumPopularity: spotifyAlbumInfo.popularity,
      spotifyAlbumPopularityStars: '★'.repeat(Math.floor(spotifyAlbumInfo.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyAlbumInfo.popularity / 20))
    }))
  }
  switch (postInfoArray.length) {
    case 0: {
      break
    }
    case 1: {
      postTextArray.push('')
      // postTextArray.push(`[ℹ️] ${postInfoArray[0]}`)
      postTextArray.push(lang(ctxLang, { key: 'tfPnalbumPostOneInfoHeader', value: '[ℹ️] {{postInfo}}' }, { postInfo: postInfoArray[0] }))
      break
    }
    default: {
      postTextArray.push('')
      // postTextArray.push('[ℹ️] Informações')
      postTextArray.push(lang(ctxLang, { key: 'tfPnalbumPostInfoHeader', value: '[ℹ️] Informações' }))
      postInfoArray.forEach((info) => {
        postTextArray.push(`${info}`)
      })
      break
    }
  }
  postTextArray.push('')
  postTextArray.push(`${spotifyAlbumInfo.external_urls.spotify}`)
  const postUrl = `https://x.com/intent/tweet?text=${postTextArray.map((text) => encodeURIComponent(text)).join('%0A')}`

  const textArray: string[] = []
  // textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.albumImgUrl}">️️</a><b><a href="${urlLimiter(user.url)}">${user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name)}</a> ${nowPlaying ? 'está ouvindo' : 'estava ouvindo'}:</b>`)
  switch (nowPlaying) {
    case true:
      textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.albumImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPnalbumHeaderNowPlaying', value: '<b><a href="{{userUrl}}">{{userName}}</a> está ouvindo:</b>' }, { userUrl: urlLimiter(user.url), userName: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
    case false:
      textArray.push(`<a href="${album.image[album.image.length - 1]['#text']}">️️</a><a href="${melodyScoutConfig.albumImgUrl}">️️</a>${lang(ctxLang, { key: 'tfPnalbumHeaderLastPlayed', value: '<b><a href="{{userUrl}}">{{userName}}</a> estava ouvindo:</b>' }, { userUrl: urlLimiter(user.url), userName: user.realname.length > 0 ? sanitizeText(user.realname) : sanitizeText(user.name) })}`)
      break
  }
  textArray.push('')
  switch (nowPlaying) {
    case true:
      // textArray.push('<b>[🎧] Ouvindo o album</b>')
      textArray.push(lang(ctxLang, { key: 'tfPnalbumHeaderNowPlayingAlbum', value: '<b>[🎧] Ouvindo o album</b>' }))
      break
    case false:
      // textArray.push('<b>[🎧] Último album ouvido</b>')
      textArray.push(lang(ctxLang, { key: 'tfPnalbumHeaderLastPlayedAlbum', value: '<b>[🎧] Último album ouvido</b>' }))
      break
  }
  // textArray.push(`- Álbum: <b><a href="${urlLimiter(album.url)}">${sanitizeText(album.name)}</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfPnalbumAlbumName', value: '- Álbum: <b><a href="{{albumUrl}}">{{albumName}}</a></b>' }, { albumUrl: urlLimiter(album.url), albumName: sanitizeText(album.name) }))
  // textArray.push(`- Artista: <b><a href="${urlLimiter(artist.url)}">${sanitizeText(artist.name)}</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfPnalbumArtistName', value: '- Artista: <b><a href="{{artistUrl}}">{{artistName}}</a></b>' }, { artistUrl: urlLimiter(artist.url), artistName: sanitizeText(artist.name) }))
  const infoArray: string[] = []
  switch (true) {
    default: {
      if (userAlbumTotalPlaytime.status === 'loading') {
        // infoArray.push('- Carregando tempo de reprodução...')
        infoArray.push(lang(ctxLang, { key: 'tfPnalbumInfoLoadingPlaytime', value: '- Carregando tempo de reprodução...' }))
        break
      }
      if (userAlbumTotalPlaytime.status === 'error') {
        // infoArray.push('- Erro ao carregar tempo de reprodução.')
        infoArray.push(lang(ctxLang, { key: 'tfPnalbumInfoErrorLoadingPlaytime', value: '- Erro ao carregar tempo de reprodução.' }))
        break
      }
      if (userAlbumTotalPlaytime.status === 'success') {
        const playedHours = Math.floor(userAlbumTotalPlaytime.totalPlaytime / 3600)
        const playedMinutes = Math.floor((userAlbumTotalPlaytime.totalPlaytime % 3600) / 60)
        // infoArray.push(`- Você já ouviu esse album por <b>${playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))} horas</b> e <b>${playedMinutes} minutos</b>.`)
        infoArray.push(lang(ctxLang, { key: 'tfPnalbumInfoTotalPlaytime', value: '- Você já ouviu esse album por <b>{{playedHours}} horas</b> e <b>{{playedMinutes}} minutos</b>.' }, {
          playedHours: playedHours.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' })),
          playedMinutes
        }))
      }
    }
  }
  // if (spotifyAlbumInfo.popularity !== undefined) infoArray.push(`- A <a href="${melodyScoutConfig.popularityImgUrl}">popularidade</a> atual desse album é: <b>[${spotifyAlbumInfo.popularity}][${'★'.repeat(Math.floor(spotifyAlbumInfo.popularity / 20))}${'☆'.repeat(5 - Math.floor(spotifyAlbumInfo.popularity / 20))}]</b>`)
  if (spotifyAlbumInfo.popularity !== undefined) {
    infoArray.push(lang(ctxLang, { key: 'tfPnalbumInfoPopularity', value: '- A <a href="{{popularityHelpImgUrl}}">popularidade</a> atual desse album é: <b>[{{spotifyAlbumPopularity}}][{{spotifyAlbumPopularityStars}}]</b>' }, {
      popularityHelpImgUrl: melodyScoutConfig.popularityImgUrl,
      spotifyAlbumPopularity: spotifyAlbumInfo.popularity,
      spotifyAlbumPopularityStars: '★'.repeat(Math.floor(spotifyAlbumInfo.popularity / 20)) + '☆'.repeat(5 - Math.floor(spotifyAlbumInfo.popularity / 20))
    }))
  }
  if (infoArray.length > 0) {
    textArray.push('')
    // textArray.push('<b>[ℹ️] Informações</b>')
    textArray.push(lang(ctxLang, { key: 'tfPnalbumInfoHeader', value: '<b>[ℹ️] Informações</b>' }))
    textArray.push(...infoArray)
  }
  textArray.push('')
  // textArray.push(`<b>[📊] ${(album.userplaycount ?? 0).toLocaleString('pt-BR')} Scrobbles</b>`)
  textArray.push(lang(ctxLang, { key: 'tfPnalbumScrobblesHeader', value: '<b>[📊] {{albumScrobbles}} Scrobbles</b>' }, { albumScrobbles: (album.userplaycount ?? 0).toLocaleString('pt-BR') }))
  textArray.push('')
  // textArray.push('<b>[🎶] As suas mais ouvidas</b>')
  textArray.push(lang(ctxLang, { key: 'tfPnalbumTopTracksHeader', value: '<b>[🎶] As suas mais ouvidas</b>' }))
  switch (true) {
    default: {
      if (userAlbumTopTracks.status === 'loading') {
        // textArray.push('- Carregando...')
        textArray.push(lang(ctxLang, { key: 'tfPnalbumLoadingTopTracks', value: '- Carregando...' }))
        break
      }
      if (userAlbumTopTracks.status === 'error') {
        // textArray.push('- Erro ao carregar musicas.')
        textArray.push(lang(ctxLang, { key: 'tfPnalbumErrorLoadingTopTracks', value: '- Erro ao carregar musicas.' }))
        break
      }
      if (userAlbumTopTracks.status === 'success') {
        if (userAlbumTopTracks.data.length <= 0) {
          // textArray.push('- Nenhuma musica encontrada.')
          textArray.push(lang(ctxLang, { key: 'tfPnalbumNoTopTracks', value: '- Nenhuma musica encontrada.' }))
          break
        }
        for (let i = 0; i < userAlbumTopTracks.data.length && i < 10; i++) {
          const track = userAlbumTopTracks.data[i]
          // textArray.push(`- (${Number(track.playcount).toLocaleString('pt-BR')}x) <a href="${urlLimiter(track.url)}">${sanitizeText(track.name)}</a>`)
          textArray.push(lang(ctxLang, { key: 'tfPnalbumTopTrackItem', value: '- ({{trackPlaycount}}x) <a href="{{trackUrl}}">{{trackName}}</a>' }, {
            trackPlaycount: Number(track.playcount).toLocaleString('pt-BR'),
            trackUrl: urlLimiter(track.url),
            trackName: sanitizeText(track.name)
          }))
        }
      }
    }
  }
  textArray.push('')
  // textArray.push('<b>[🔗] Compartilhe</b>')
  textArray.push(lang(ctxLang, { key: 'tfPnalbumShareHeader', value: '<b>[🔗] Compartilhe</b>' }))
  // textArray.push(`- <a href="${postUrl}">Compartilhar no 𝕏!</a>`)
  textArray.push(lang(ctxLang, { key: 'tfPnalbumShareOnX', value: '- <a href="{{postUrl}}">Compartilhar no 𝕏!</a>' }, { postUrl }))

  const text = textArray.join('\n')
  return text
}
