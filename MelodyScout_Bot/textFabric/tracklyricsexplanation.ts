import { sanitizeText } from '../../function/sanitizeText'
import config from '../../config'

export function getTracklyricsexplanationText (track: string, artist: string, lyricsExplanation: string, requestedBy: string): string {
  const textArray: string[] = []

  textArray.push(`<b>[✨] Explicação de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida pelo <a href="${config.melodyScout.aboutMelodyScoutAi}">MelodyScoutAi</a> solicitada por ${requestedBy}</b>`)
  textArray.push('')
  textArray.push(`${lyricsExplanation}`)

  const text = textArray.join('\n')
  return text
}
