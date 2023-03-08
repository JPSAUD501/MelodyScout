import { AdvConsole } from '../../function/advancedConsole'
import { Configuration, OpenAIApi } from 'openai'

interface MsOpenAiApiError {
  success: false
  error: string
}

type MsOpenAiApiGetLyricsExplanationResponse = {
  success: true
  explanation: string
} | MsOpenAiApiError

type MsOpenAiApiGetLyricsEmojisResponse = {
  success: true
  emojis: string
} | MsOpenAiApiError

export class MsOpenAiApi {
  private readonly advConsole: AdvConsole
  private readonly openai: OpenAIApi

  constructor (advConsole: AdvConsole, openAiApiKey: string) {
    this.advConsole = advConsole
    const configuration = new Configuration({
      apiKey: openAiApiKey
    })
    this.openai = new OpenAIApi(configuration)

    this.advConsole.log('OpenAiApi started!')
  }

  async getLyricsExplanation (lyrics: string): Promise<MsOpenAiApiGetLyricsExplanationResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `${lyricsParsed}\n\nExplicação da letra da música:`
    const response = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é o MelodyScoutAI, uma inteligencia artificial que ajuda os usuários a entenderem a letra das músicas que eles ouvem.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 425,
      temperature: 0.7
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      this.advConsole.log(`MsOpenAiAPi - Error while generating explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.data.choices[0]
    // console.log(explanation)
    if (explanation === undefined) {
      this.advConsole.log(`MsOpenAiAPi - No choices explanation generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    let explanationText: string | undefined = explanation.message?.content.replace(/\n{2,}/g, '\n\n').trim()
    if (explanationText === undefined) {
      this.advConsole.log(`MsOpenAiAPi - No explanation text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No explanation text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          this.advConsole.log(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          explanationText += '...\n(A explicação foi interrompida por um erro desconhecido)'
          break
        }
        case null: {
          break
        }
        default: {
          this.advConsole.log(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
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

  async getLyricsEmojis (lyrics: string): Promise<MsOpenAiApiGetLyricsEmojisResponse> {
    const lyricsParsed = lyrics.replace(/\[.*\]/g, '').replace(/\n{2,}/g, '\n\n').trim()
    const prompt = `${lyricsParsed}\n\nAté 15 emojis que representam a letra da música:`
    const response = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é o MelodyScoutAI, uma inteligencia artificial que converte letras de músicas em emojis.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 75,
      temperature: 0.7
    }).catch((err) => {
      return new Error(String(err))
    })
    if (response instanceof Error) {
      this.advConsole.log(`MsOpenAiAPi - Error while generating emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - ${response.message} - ${response.stack ?? 'No STACK'} - ${response.name}`)
      return {
        success: false,
        error: response.message
      }
    }
    const explanation = response.data.choices[0]
    if (explanation === undefined) {
      this.advConsole.log(`MsOpenAiAPi - No choices emojis generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    const emojisText: string | undefined = explanation.message?.content.replace(/\n{2,}/g, '\n\n').trim()
    if (emojisText === undefined) {
      this.advConsole.log(`MsOpenAiAPi - No emojis text generated for lyrics: ${lyricsParsed.substring(0, 40)}...`)
      return {
        success: false,
        error: 'No emojis text generated'
      }
    }
    if (explanation.finish_reason !== 'stop') {
      switch (explanation.finish_reason) {
        case undefined: {
          this.advConsole.log(`MsOpenAiAPi - Emojis for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: undefined`)
          break
        }
        case null: {
          this.advConsole.log(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: null`)
          break
        }
        default: {
          this.advConsole.log(`MsOpenAiAPi - Explanation for lyrics: ${lyricsParsed.substring(0, 40)}... - was not finished! Finish reason: ${JSON.stringify(explanation.finish_reason, null, 2)}`)
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
