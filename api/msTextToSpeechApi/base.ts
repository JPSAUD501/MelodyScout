import * as googleTTS from 'google-tts-api'
import axios from 'axios'
import { TiktokTTSApi, zodTiktokTTSApi } from './types/zodTiktokTTSApi'
import { advError } from '../../function/advancedConsole'
import { lang } from '../../translations/base'
import { z } from 'zod'

const tiktokApiEndpoint = 'https://tiktok-tts.weilnet.workers.dev'
const tiktokApiMaxTextLength = 300
const zodTiktokApiVoice = z.object({
  id: z.string(),
  emoji: z.string()
})
type TiktokApiVoice = z.infer<typeof zodTiktokApiVoice>
const tiktokApiVoices: Record<string, TiktokApiVoice[]> = {
  br: [{
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
  }],
  en: [{
    id: 'en_us_001',
    emoji: '👧'
  },
  {
    id: 'en_us_006',
    emoji: '👨'
  },
  {
    id: 'n_us_007',
    emoji: '👨'
  },
  {
    id: 'en_us_009',
    emoji: '👨'
  },
  {
    id: 'en_us_010',
    emoji: '👨'
  },
  {
    id: 'en_uk_001',
    emoji: '👨'
  },
  {
    id: 'en_uk_003',
    emoji: '👨'
  },
  {
    id: 'en_au_001',
    emoji: '👩'
  },
  {
    id: 'en_au_002',
    emoji: '👨'
  },
  {
    id: 'en_us_ghostface',
    emoji: '👻'
  },
  {
    id: 'en_us_c3po',
    emoji: '🤖'
  },
  {
    id: 'en_us_stitch',
    emoji: '👽'
  },
  {
    id: 'en_us_stormtrooper',
    emoji: '👾'
  },
  {
    id: 'en_us_rocket',
    emoji: '🦝'
  }]
}

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
  private async getTiktokTTS (ctxLang: string | undefined, fullText: string): Promise<MsTextToSpeechApiGetTiktokTTSResponse> {
    const splittedText = fullText.match(/.{1,200}([,;.!?:]|$|\n)/g) ?? []
    splittedText.forEach((text, index) => {
      splittedText[index] = text.replace(/\n/g, '')
    })
    console.log(splittedText)
    const error = splittedText.find((text) => {
      return text.length > tiktokApiMaxTextLength
    })
    if (error !== undefined) {
      advError(`MsTextToSpeechApi - Error a text part is greater than ${tiktokApiMaxTextLength} characters: ${error.substring(0, 40)}...`)
      return {
        success: false,
        error: `Text length is greater than ${tiktokApiMaxTextLength} characters (Max Tiktok TTS text length)`
      }
    }
    const tiktokApiVoiceOptions = tiktokApiVoices[lang(ctxLang, 'tiktokApiVoiceCode')]
    if (tiktokApiVoiceOptions === undefined) {
      advError(`MsTextToSpeechApi - Error no Tiktok TTS voice options for language: ${lang(ctxLang, 'tiktokApiVoiceCode')}`)
      return {
        success: false,
        error: `No Tiktok TTS voice options for language: ${lang(ctxLang, 'tiktokApiVoiceCode')}`
      }
    }
    const tiktokApiVoice = tiktokApiVoiceOptions[Math.floor(Math.random() * tiktokApiVoiceOptions.length)]
    const axiosRequests = splittedText.map(async (text) => {
      return await axios.post(`${tiktokApiEndpoint}/api/generation`, {
        text,
        voice: tiktokApiVoice.id
      })
    })
    const axiosResponses = await Promise.all(axiosRequests).catch((error) => {
      return new Error(error)
    })
    if (axiosResponses instanceof Error) {
      advError(`MsTextToSpeechApi - Error while generating Tiktok TTS for text: ${fullText.substring(0, 40)}... - ${axiosResponses.message}`)
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
        advError(`MsTextToSpeechApi - Error while generating Tiktok TTS for text: ${fullText.substring(0, 40)}... - ${JSON.stringify(tiktokTTSApiZodResponse.error)}`)
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
      advError(`MsTextToSpeechApi - Error while generating Tiktok TTS for text, Tiktok TTS API returned success false: ${fullText.substring(0, 40)}... - ${findForFalseSuccess.error ?? 'No error string'}`)
      return {
        success: false,
        error: findForFalseSuccess.error ?? 'Tiktok TTS API returned success false and no error string'
      }
    }
    const findForNoData = allTikTokTTSApiValidResponses.find((tiktokTTSApiResponse) => {
      return tiktokTTSApiResponse.data === null
    })
    if (findForNoData !== undefined) {
      advError(`MsTextToSpeechApi - Error while generating Tiktok TTS for text, Tiktok TTS API returned success true but data is null: ${fullText.substring(0, 40)}...`)
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
        voice: tiktokApiVoice
      }
    }
  }

  async getTTS (ctxLang: string | undefined, header: string, text: string): Promise<MsTextToSpeechApiGetTTSResponse> {
    const fullText = `${header}\n\n${text}`
    const tiktokTTSResponse = await this.getTiktokTTS(ctxLang, fullText)
    if (tiktokTTSResponse.success) {
      return {
        success: true,
        data: {
          audio: tiktokTTSResponse.data.audio,
          voice: tiktokTTSResponse.data.voice
        }
      }
    }
    const googleTTSResponse = await googleTTS.getAllAudioBase64(fullText, {
      // lang: 'pt',
      lang: lang(ctxLang, 'googleTTSVoiceCode'),
      slow: false,
      splitPunct: ',;.!?:'
    }).catch((error) => {
      return new Error(error)
    })
    if (googleTTSResponse instanceof Error) {
      advError(`MsTextToSpeechApi - Error while generating Google TTS for text: ${text.substring(0, 40)}... - ${googleTTSResponse.message}`)
      return {
        success: false,
        error: googleTTSResponse.message
      }
    }
    const GoogleTTSBase64Array = googleTTSResponse.map((TTSObject) => {
      return TTSObject.base64
    })
    const googleConcatenatedAudio = Buffer.concat(GoogleTTSBase64Array.map(base64 => Buffer.from(base64, 'base64')))
    return {
      success: true,
      data: {
        audio: googleConcatenatedAudio,
        voice: defaultGoogleTTSVoice
      }
    }
  }
}
