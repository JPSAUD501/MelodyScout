import { lang } from '../../translations/base'

export function getTrackdownloadText (ctxLang: string | undefined, track: string, artist: string, requesterId: string, requesterName: string): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, { key: 'chooseTrackDownloadOptionMessage', value: '<b>[📥] Download de "{{track}}" por "{{artist}}"</b>\n- Por favor escolha uma opção abaixo.\n\nSolicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' }, { track, artist, requesterId, requesterName }))
  const text = textArray.join('\n')
  return text
}
