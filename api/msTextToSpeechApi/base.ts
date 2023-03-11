import * as googleTTS from 'google-tts-api'
import { AdvConsole } from '../../function/advancedConsole'
import axios from 'axios'
import { TiktokTTSApi, zodTiktokTTSApi } from './types/zodTiktokTTSApi'

const tiktokApiEndpoint = 'https://tiktok-tts.weilnet.workers.dev'
const tiktokApiMaxTextLength = 300
const tiktokApiVoices = [{
  id: 'br_003',
  emoji: '👧'
},
{
  id: 'br_004',
  emoji: '👩'
},
{
  id: 'br_005',
  emoji: '👨'
},
{
  id: 'br_ghostface',
  emoji: '👻'
}]

const defaultGoogleTTSVoice = {
  id: 'Google',
  emoji: '🤖'
}

interface MsTextToSpeechApiError {
  success: false
  error: string
}

type MsTextToSpeechApiGetTiktokTTSResponse = {
  success: true
  data: {
    audio: Buffer
    voice: {
      id: string
      emoji: string
    }
  }
} | MsTextToSpeechApiError

type MsTextToSpeechApiGetTTSResponse = {
  success: true
  data: {
    audio: Buffer
    voice: {
      id: string
      emoji: string
    }
  }
} | MsTextToSpeechApiError

export class MsTextToSpeechApi {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

  private async getTiktokTTS (textArray: string[]): Promise<MsTextToSpeechApiGetTiktokTTSResponse> {
    const error = textArray.find((text) => {
      return text.length > tiktokApiMaxTextLength
    })
    if (error !== undefined) {
      this.advConsole.error(`MsTextToSpeechApi - Error a text part is greater than ${tiktokApiMaxTextLength} characters: ${error.substring(0, 40)}...`)
      return {
        success: false,
        error: `Text length is greater than ${tiktokApiMaxTextLength} characters (Max Tiktok TTS text length)`
      }
    }
    const tiktokApiDefaultVoice = tiktokApiVoices[Math.floor(Math.random() * tiktokApiVoices.length)]
    const axiosRequests = textArray.map(async (text) => {
      return await axios.post(`${tiktokApiEndpoint}/api/generation`, {
        text,
        voice: tiktokApiDefaultVoice.id
      })
    })
    const axiosResponses = await Promise.all(axiosRequests).catch((error) => {
      return new Error(error)
    })
    if (axiosResponses instanceof Error) {
      this.advConsole.error(`MsTextToSpeechApi - Error while generating Tiktok TTS for text: ${textArray[0].substring(0, 40)}... - ${axiosResponses.message}`)
      return {
        success: false,
        error: axiosResponses.message
      }
    }
    const axiosResponsesDataArray = axiosResponses.map((axiosResponse) => {
      return axiosResponse.data
    })
    const allTikTokTTSApiValidResponses: TiktokTTSApi[] = []
    for (const axiosResponseData of axiosResponsesDataArray) {
      const tiktokTTSApiZodResponse = zodTiktokTTSApi.safeParse(axiosResponseData)
      if (!tiktokTTSApiZodResponse.success) {
        this.advConsole.error(`MsTextToSpeechApi - Error while generating Tiktok TTS for text: ${textArray[0].substring(0, 40)}... - ${JSON.stringify(tiktokTTSApiZodResponse.error)}`)
        return {
          success: false,
          error: 'Tiktok TTS API response is invalid'
        }
      }
      allTikTokTTSApiValidResponses.push(tiktokTTSApiZodResponse.data)
    }
    const findForFalseSuccess = allTikTokTTSApiValidResponses.find((tiktokTTSApiResponse) => {
      return !tiktokTTSApiResponse.success
    })
    if (findForFalseSuccess !== undefined) {
      this.advConsole.error(`MsTextToSpeechApi - Error while generating Tiktok TTS for text, Tiktok TTS API returned success false: ${textArray[0].substring(0, 40)}... - ${findForFalseSuccess.error ?? 'No error string'}`)
      return {
        success: false,
        error: findForFalseSuccess.error ?? 'Tiktok TTS API returned success false and no error string'
      }
    }
    const findForNoData = allTikTokTTSApiValidResponses.find((tiktokTTSApiResponse) => {
      return tiktokTTSApiResponse.data === null
    })
    if (findForNoData !== undefined) {
      this.advConsole.error(`MsTextToSpeechApi - Error while generating Tiktok TTS for text, Tiktok TTS API returned success true but data is null: ${textArray[0].substring(0, 40)}...`)
      return {
        success: false,
        error: 'Tiktok TTS API returned success true but data is null'
      }
    }
    const allTikTokTTSApiValidResponsesData = allTikTokTTSApiValidResponses.map((tiktokTTSApiResponse) => {
      return tiktokTTSApiResponse.data ?? ''
    })
    const concatenatedAudio = Buffer.concat(allTikTokTTSApiValidResponsesData.map(base64 => Buffer.from(base64, 'base64')))

    return {
      success: true,
      data: {
        audio: concatenatedAudio,
        voice: tiktokApiDefaultVoice
      }
    }
  }

  async getTTS (header: string, text: string): Promise<MsTextToSpeechApiGetTTSResponse> {
    const headerGoogleTTSResponse = await googleTTS.getAllAudioBase64(header, {
      lang: 'pt',
      slow: false,
      splitPunct: ',;.!?:'
    }).catch((error) => {
      return new Error(error)
    })
    if (headerGoogleTTSResponse instanceof Error) {
      this.advConsole.error(`MsTextToSpeechApi - Error while generating Google TTS for header: ${header.substring(0, 40)}... - ${headerGoogleTTSResponse.message}`)
      return {
        success: false,
        error: headerGoogleTTSResponse.message
      }
    }
    const headerGoogleTTSBuffer = Buffer.concat(headerGoogleTTSResponse.map(base64 => Buffer.from(base64.base64, 'base64')))
    const splittedText = text.match(/.{1,200}([,;.!?:]|$|\n)/g) ?? []
    console.log(splittedText)
    const tiktokTTSResponse = await this.getTiktokTTS(splittedText)
    if (tiktokTTSResponse.success) {
      return {
        success: true,
        data: {
          audio: Buffer.concat([headerGoogleTTSBuffer, tiktokTTSResponse.data.audio]),
          voice: tiktokTTSResponse.data.voice
        }
      }
    }
    const googleTTSResponse = await googleTTS.getAllAudioBase64(text, {
      lang: 'pt',
      slow: false,
      splitPunct: ',;.!?:'
    }).catch((error) => {
      return new Error(error)
    })
    if (googleTTSResponse instanceof Error) {
      this.advConsole.error(`MsTextToSpeechApi - Error while generating Google TTS for text: ${text.substring(0, 40)}... - ${googleTTSResponse.message}`)
      return {
        success: false,
        error: googleTTSResponse.message
      }
    }
    const GoogleTTSBase64Array = googleTTSResponse.map((TTSObject) => {
      return TTSObject.base64
    })
    const concatenatedAudio = Buffer.concat(GoogleTTSBase64Array.map(base64 => Buffer.from(base64, 'base64')))
    return {
      success: true,
      data: {
        audio: Buffer.concat([headerGoogleTTSBuffer, concatenatedAudio]),
        voice: defaultGoogleTTSVoice
      }
    }
  }
}
