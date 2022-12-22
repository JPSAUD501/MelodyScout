import { UserInfo } from '../../api/msLastfmApi/types/zodUserInfo'
import { UserRecentTracks } from '../../api/msLastfmApi/types/zodUserRecentTracks'

export function getHelpText (): string {
  const textArray: string[] = [
    '<b>Meus comandos!</b>',
    '',
    '<b>/start</b> - Inicia o bot',
    '<b>/help</b> - Mostra essa linda mensagem',
    '<b>/contact</b> - Mostra o contato do desenvolvedor',
    '',
    '<b>Aguarde! Mais comandos estão por vir!</b>'
  ]
  const text = textArray.join('\n')
  return text
}

export function getBriefText (userInfo: UserInfo, userRecentTracks: UserRecentTracks): string {
  const { user } = userInfo
  const { recenttracks } = userRecentTracks
  const textArray: string[] = []

  textArray.push(`<b>Resumo musical de <a href="${user.url}">${user.realname.length > 0 ? user.realname : user.name}</a></b>`)
  textArray.push('')
  if (
    recenttracks.track.length > 0 &&
      (recenttracks.track[0]['@attr'] != null) &&
      recenttracks.track[0]['@attr'].nowplaying === 'true'
  ) {
    const track = recenttracks.track[0]
    textArray.push('<b>[🎧] Ouvindo agora:</b>')
    textArray.push(`- <a href="${track.url}">${track.name}</a> de <a href="${track.artist.url}">${track.artist.name}</a>`)
    textArray.push('')
  }
  textArray.push('<b>[🏅] Conquistas:</b>')
  textArray.push(`- Músicas ouvidas: <b>${Number(user.playcount)}</b>`)
  textArray.push(`- Músicas conhecidas: <b>${Number(user.track_count)}</b>`)
  textArray.push(`- Músicas repetidas: <b>${Number(user.playcount) - Number(user.track_count)}</b>`)
  textArray.push(`- Artistas conhecidos: <b>${Number(user.artist_count)}</b>`)
  textArray.push(`- Álbuns conhecidos: <b>${Number(user.album_count)}</b>`)
  textArray.push('')
  textArray.push('<b>[ℹ] Informações:</b>')
  textArray.push(`- Dentre as suas músicas ouvidas <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.playcount) * 100).toFixed(2)}%</b> são repetidas e <b>${((Number(user.track_count) / Number(user.playcount)) * 100).toFixed(2)}%</b> são novas.`)
  textArray.push(`- Em média você repete <b>${((Number(user.playcount) - Number(user.track_count)) / Number(user.track_count)).toFixed(2)}</b> vezes cada música que conhece.`)
  textArray.push('')
  if (recenttracks.track.length > 0) {
    textArray.push('<b>[📒] Histórico de reprodução:</b>')
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

// export function getNowPlayingText (userInfo: UserInfo, userRecentTracks: UserRecentTracks): string {
//   const { user } = userInfo
//   const { recenttracks } = userRecentTracks
//   const textArray: string[] = []

//   textArray.push('')

//   const text = textArray.join('\n')
//   return text
// }
