import OpenAI from 'openai'
import { advError } from '../../functions/advancedConsole'
import { lang } from '../../translations/base'

interface MsOpenAiApiError {
  success: false
  error: string
}

type MsOpenAiApiGetLyricsExplanationResponse = {
  success: true
  explanation: string
} | MsOpenAiApiError

type MsOpenAiApiGetLyricsImageDescriptionResponse = {
  success: true
  description: string
} | MsOpenAiApiError

type MsOpenAiApiGetLyricsEmojisResponse = {
  success: true
  emojis: string
} | MsOpenAiApiError

export class MsOpenAiApi {
  private readonly openai: OpenAI

  constructor (openAiApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openAiApiKey
    })
  }

  async getLyricsExplanation (ctxLang: string | undefined, lyrics: string): Promise<MsOpenAiApiGetLyricsExplanationResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `${lyricsParsed}\n\n${lang(ctxLang, { key: 'lyricsExplanationAiPrompt', value: 'Explicação resumida da letra da música:' })}`
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You help users understand the lyrics of the tracks they listened.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 425,
      temperature: 0.7
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      advError(`MsOpenAiAPi - Error while generating explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.choices[0]
    // console.log(explanation)
    if (explanation === undefined) {
      advError(`MsOpenAiAPi - No choices explanation generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    let explanationText: string | undefined = explanation.message?.content?.replace(/\n{2,}/g, '\n\n').trim()
    if (explanationText === undefined) {
      advError(`MsOpenAiAPi - No explanation text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No explanation text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          advError(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          explanationText += '...\n(A explicação foi interrompida por um erro desconhecido)'
          break
        }
        case null: {
          break
        }
        default: {
          advError(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
          explanationText += '...\n(A explicação excedeu o limite de caracteres)'
          break
        }
      }
    }

    return {
      success: true,
      explanation: explanationText
    }
  }

  async getLyricsImageDescription (lyrics: string): Promise<MsOpenAiApiGetLyricsImageDescriptionResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `Lyrics:\n\n${lyricsParsed}`
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Describe an simple and creative image that best represents the song. Your description must have up to 60 words.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      advError(`MsOpenAiAPi - Error while generating image description for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.choices[0]
    if (explanation === undefined) {
      advError(`MsOpenAiAPi - No choices image description generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    const imageDescription: string | undefined = explanation.message?.content?.replace(/\n/g, '').trim()
    if (imageDescription === undefined) {
      advError(`MsOpenAiAPi - No image description text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No image description text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          advError(`MsOpenAiAPi - Image description for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          break
        }
        case null: {
          advError(`MsOpenAiAPi - Image description for for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: null`)
          break
        }
        default: {
          advError(`MsOpenAiAPi - Image description for for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
          break
        }
      }
    }

    return {
      success: true,
      description: imageDescription
    }
  }

  async getLyricsEmojis (lyrics: string): Promise<MsOpenAiApiGetLyricsEmojisResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `Lyrics:\n\n${lyricsParsed}`
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Using the lyrics received, create a selection of emojis that best represent the song. The answer must only contain emojis. The answer must have up to 40 emojis.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      advError(`MsOpenAiAPi - Error while generating emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.choices[0]
    if (explanation === undefined) {
      advError(`MsOpenAiAPi - No choices emojis generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    // Remove new line, letters and numbers
    const emojisText: string | undefined = explanation.message?.content?.replace(/\n/g, '').replace(/[a-zA-Z0-9]/g, '').trim()
    if (emojisText === undefined) {
      advError(`MsOpenAiAPi - No emojis text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No emojis text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          advError(`MsOpenAiAPi - Emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          break
        }
        case null: {
          advError(`MsOpenAiAPi - Emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: null`)
          break
        }
        default: {
          advError(`MsOpenAiAPi - Emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
          break
        }
      }
    }

    return {
      success: true,
      emojis: emojisText
    }
  }
}
