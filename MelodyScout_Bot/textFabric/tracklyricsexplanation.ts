import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { lang } from '../../translations/base'

export function getTracklyricsexplanationText (ctxLang: string | undefined, track: string, artist: string, lyricsExplanation: string, lyricsEmojis: string | undefined, requestedBy: string, explanationImageUrl: string | undefined): string {
  const textArray: string[] = []
  textArray.push(`<a href="${explanationImageUrl ?? ''}">️️</a><a href="${melodyScoutConfig.artificialIntelligenceImgUrl}">️️</a>${lang(ctxLang, 'tfTracklyricsexplanationHeader', { trackName: sanitizeText(track), artistName: sanitizeText(artist), melodyScoutAiAboutUrl: melodyScoutConfig.aboutMelodyScoutAi, requestedBy })}`)
  textArray.push('')
  textArray.push(`${lyricsExplanation}`)
  if (lyricsEmojis !== undefined) {
    textArray.push('')
    // textArray.push(`Em emojis: ${lyricsEmojis}`)
    textArray.push(lang(ctxLang, 'tfTracklyricsexplanationInEmojis', { lyricsEmojis }))
  }

  const text = textArray.join('\n')
  return text
}
