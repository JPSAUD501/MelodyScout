import { lang } from '../../translations/base'

export function getTrackaudiodownloadText (ctxLang: string | undefined, track: string, artist: string, requesterId: string, requesterName: string): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, 'trackAudioDownloadCaption', { track, artist, requesterId, requesterName }))
  const text = textArray.join('\n')
  return text
}
