import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'

export function getTracklyricsexplanationText (track: string, artist: string, lyricsExplanation: string, lyricsEmojis: string | undefined, requestedBy: string): string {
  const textArray: string[] = []

  textArray.push(`<b>[✨] Explicação de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida pelo <a href="${melodyScoutConfig.aboutMelodyScoutAi}">MelodyScoutAi</a> solicitada por ${requestedBy}</b>`)
  textArray.push('')
  textArray.push(`${lyricsExplanation}`)
  if (lyricsExplanation.includes('\n\n') && (lyricsEmojis !== undefined)) textArray.push('')
  if (lyricsEmojis !== undefined) textArray.push(`Em emojis: ${lyricsEmojis}`)

  const text = textArray.join('\n')
  return text
}
