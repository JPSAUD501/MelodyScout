import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../function/sanitizeText'
import { lang } from '../../translations/base'

export function getTracklyricsexplanationText (ctxLang: string | undefined, track: string, artist: string, lyricsExplanation: string, lyricsEmojis: string | undefined, requestedBy: string, explanationImage: {
  status: 'loading' | 'success' | 'error'
  imageUrl: string
}): string {
  const textArray: string[] = []
  const image = {
    url: melodyScoutConfig.artificialIntelligenceImgUrl
  }
  switch (explanationImage.status) {
    case ('loading'): {
      image.url = melodyScoutConfig.artificialIntelligenceImgUrl
      break
    }
    case ('success'): {
      image.url = explanationImage.imageUrl
      break
    }
    case ('error'): {
      image.url = melodyScoutConfig.artificialIntelligenceImgErrorUrl
      break
    }
  }
  textArray.push(`<a href="${image.url}">️️</a><a href="${melodyScoutConfig.artificialIntelligenceImgUrl}">️️</a>${lang(ctxLang, 'tfTracklyricsexplanationHeader', { trackName: sanitizeText(track), artistName: sanitizeText(artist), melodyScoutAiAboutUrl: melodyScoutConfig.aboutMelodyScoutAi, requestedBy })}`)
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
