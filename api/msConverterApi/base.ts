import axios from 'axios'
import { advError, advLog } from '../../functions/advancedConsole'
import { z } from 'zod'

interface MsConverterApiError {
  success: false
  error: string
}

type MsConverterConvertHtmlToImageResponse = {
  success: true
  image: Buffer
} | MsConverterApiError

export class MsConverterApi {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async convertHtmlToImage (html: string): Promise<MsConverterConvertHtmlToImageResponse> {
    try {
      advLog('MsConverterApi - convertHtmlToImage - Converting HTML to image...')
      const requestResponse = await axios.post('https://us-central1-melodyscout.cloudfunctions.net/api/v1/convert/html/to/image', {
        html
      }, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        responseType: 'json'
      }).catch((err) => {
        return new Error(String(err))
      })
      if (requestResponse instanceof Error) {
        advError(`MsConverterApi - convertHtmlToImage - Error on request: ${requestResponse.message}`)
        return {
          success: false,
          error: requestResponse.message
        }
      }
      const safeParseResponse = z.object({
        data: z.string()
      }).safeParse(requestResponse.data)
      if (!safeParseResponse.success) {
        advError(`MsConverterApi - convertHtmlToImage - Error on parsing response: ${JSON.stringify(safeParseResponse.error)}`)
        return {
          success: false,
          error: 'Error on parsing response'
        }
      }
      const image = Buffer.from(safeParseResponse.data.data, 'base64')
      advLog('MsConverterApi - convertHtmlToImage - Success!')
      return {
        success: true,
        image
      }
    } catch (err) {
      advError(`MsConverterApi - convertHtmlToImage - Error Try Catch: ${String(err)}`)
      return {
        success: false,
        error: `Error Try Catch: ${String(err)}`
      }
    }
  }
}
