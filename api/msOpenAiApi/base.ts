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

export class MsOpenAiApi {
  private readonly advConsole: AdvConsole
  private readonly openai: OpenAIApi

  constructor (advConsole: AdvConsole, openAiApiKey: string) {
    this.advConsole = advConsole
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.openai = new OpenAIApi(configuration)

    this.advConsole.log('OpenAiApi started!')
  }

  async getLyricsExplanation (lyrics: string): Promise<MsOpenAiApiGetLyricsExplanationResponse> {
    const prompt = `${lyrics}\n\nExplicação da letra:`
    const response = await this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 300,
      temperature: 0.7
    })
    const explanation = response.data.choices[0]
    // console.log(explanation)
    if (explanation === undefined) {
      this.advConsole.log(`MsOpenAiAPi - No choices generated for lyrics: ${lyrics.substring(0, 20)}...`)
      return {
        success: false,
        error: 'No choices generated'
      }
    }
    let explanationText = explanation.text
    if (explanationText === undefined) {
      this.advConsole.log(`MsOpenAiAPi - No explanation text generated for lyrics: ${lyrics.substring(0, 20)}...`)
      return {
        success: false,
        error: 'No explanation text generated'
      }
    }
    explanationText = explanationText.replace(/\n/g, '')
    if (explanation.finish_reason !== 'stop') {
      explanationText += '...\n(Desculpe por isso mas a explicação excedeu o limite de caracteres)'
    }

    return {
      success: true,
      explanation: explanationText
    }
  }
}