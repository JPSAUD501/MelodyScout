import { lang } from '../../translations/base'

export function getTrackpreviewText (ctxLang: string | undefined, track: string, artist: string, requesterId: string, requesterName: string): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, { key: 'trackPreviewCaptionMessage', value: '<b>[🎵] Pré-visualização de "{{track}}" por "{{artist}}"</b>\n\nSolicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' }, { track, artist, requesterId, requesterName }))
  const text = textArray.join('\n')
  return text
}
