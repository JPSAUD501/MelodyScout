import { advError } from '../../functions/advancedConsole'
import { getLyricsImageDescriptionModel } from './models/lyricsImageDescription'

interface MsGoogleAiApiError {
  success: false
  error: string
}

type MsGoogleAiApiGetLyricsImageDescriptionResponse = {
  success: true
  description: string
} | MsGoogleAiApiError

export class MsGoogleAiApi {
  private readonly googleAiApiKey: string

  constructor (googleAiApiKey: string) {
    this.googleAiApiKey = googleAiApiKey
  }

  async getLyricsImageDescription (lyrics: string): Promise<MsGoogleAiApiGetLyricsImageDescriptionResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `Lyrics:\n\n${lyricsParsed}`
    const chat = getLyricsImageDescriptionModel(this.googleAiApiKey)
    const result = await chat.sendMessage(prompt).catch((err) => {
      return new Error(String(err))
    })
    if (result instanceof Error) {
      advError(`MsGoogleAiAPi - Error while generating image description for lyrics: ${lyricsParsed.substring(0, 40)}... - ${result.message} - ${result.stack ?? 'No STACK'} - ${result.name}`)
      return {
        success: false,
        error: result.message
      }
    }
    const explanation = result.response
    const imageDescription = explanation.text()
    return {
      success: true,
      description: imageDescription
    }
  }
}
