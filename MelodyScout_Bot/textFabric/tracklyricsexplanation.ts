import { melodyScoutConfig } from '../../config'
import { sanitizeText } from '../../functions/sanitizeText'
import { lang } from '../../translations/base'

export function getTracklyricsexplanationText (ctxLang: string | undefined, track: string, artist: string, lyricsExplanation: string, requestedBy: string, explanationImage: {
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
  textArray.push(`<a href="${image.url}">️️</a><a href="${melodyScoutConfig.artificialIntelligenceImgUrl}">️️</a>${lang(ctxLang, { key: 'tfTracklyricsexplanationHeader', value: '<b>[✨] Explicação de "{{trackName}}" por "{{artistName}}" fornecida pelo MelodyScoutAi solicitada por {{requestedBy}}</b>' }, { trackName: sanitizeText(track), artistName: sanitizeText(artist), melodyScoutAiAboutUrl: melodyScoutConfig.aboutMelodyScoutAi, requestedBy })}`)
  textArray.push('')
  textArray.push(`${lyricsExplanation}`)

  const text = textArray.join('\n')
  return text
}
