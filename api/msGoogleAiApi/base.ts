import { advError } from '../../functions/advancedConsole'
import { lang } from '../../translations/base'
import { getLyricsEmojisGenerator } from './generators/lyricsEmojis'
import { getLyricsExplanationGenerator } from './generators/lyricsExplanation'
import { getLyricsImageDescriptionGenerator } from './generators/lyricsImageDescription'

interface MsGoogleAiApiError {
  success: false
  error: string
}

type MsGoogleAiApiGetLyricsImageDescriptionResponse = {
  success: true
  description: string
} | MsGoogleAiApiError

type MsGoogleAiApiGetLyricsExplanationResponse = {
  success: true
  explanation: string
} | MsGoogleAiApiError

type MsGoogleAiApiGetLyricsEmojisResponse = {
  success: true
  emojis: string
} | MsGoogleAiApiError

export class MsGoogleAiApi {
  private readonly googleAiApiKey: string

  constructor (googleAiApiKey: string) {
    this.googleAiApiKey = googleAiApiKey
  }

  async getLyricsImageDescription (lyrics: string): Promise<MsGoogleAiApiGetLyricsImageDescriptionResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const generator = getLyricsImageDescriptionGenerator(this.googleAiApiKey, lyricsParsed)
    const result = await generator.catch((err) => {
      return new Error(String(err))
    })
    if (result instanceof Error) {
      advError(`MsGoogleAiAPi - Error while generating explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - ${result.message} - ${result.stack ?? 'No STACK'} - ${result.name}`)
      return {
        success: false,
        error: result.message
      }
    }
    const explanation = result.response
    const lyricsImageDescription = explanation.text()
    return {
      success: true,
      description: lyricsImageDescription
    }
  }

  async getLyricsExplanation (ctxLang: string | undefined, lyrics: string): Promise<MsGoogleAiApiGetLyricsExplanationResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const generator = getLyricsExplanationGenerator(this.googleAiApiKey, lyricsParsed, lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    const result = await generator.catch((err) => {
      return new Error(String(err))
    })
    if (result instanceof Error) {
      advError(`MsGoogleAiAPi - Error while generating explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - ${result.message} - ${result.stack ?? 'No STACK'} - ${result.name}`)
      return {
        success: false,
        error: result.message
      }
    }
    const explanation = result.response
    const lyricsExplanation = explanation.text()
    return {
      success: true,
      explanation: lyricsExplanation
    }
  }

  async getLyricsEmojis (lyrics: string): Promise<MsGoogleAiApiGetLyricsEmojisResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const generator = getLyricsEmojisGenerator(this.googleAiApiKey, lyricsParsed)
    const result = await generator.catch((err) => {
      return new Error(String(err))
    })
    if (result instanceof Error) {
      advError(`MsGoogleAiAPi - Error while generating explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - ${result.message} - ${result.stack ?? 'No STACK'} - ${result.name}`)
      return {
        success: false,
        error: result.message
      }
    }
    const explanation = result.response
    const lyricsEmojis = explanation.text()
    return {
      success: true,
      emojis: lyricsEmojis
    }
  }
}
