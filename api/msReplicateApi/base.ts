import Replicate from 'replicate'
import { advLog } from '../../function/advancedConsole'
import z from 'zod'
import axios from 'axios'

interface MsReplicateApiError {
  success: false
  error: string
}

type MsReplicateGetSdxlImageResponse = {
  success: true
  imageUrl: string
  image: Buffer
} | MsReplicateApiError

export class MsReplicateApi {
  private readonly replicate: Replicate

  constructor (replicateApiToken: string) {
    this.replicate = new Replicate({
      auth: replicateApiToken
    })

    advLog('MsReplicateApi started!')
  }

  async getSdxlImage (imageDescription: string): Promise<MsReplicateGetSdxlImageResponse> {
    const model = 'stability-ai/sdxl:af1a68a271597604546c09c64aabcd7782c114a63539a4a8d14d1eeda5630c33'
    const output = await this.replicate.run(
      model,
      {
        input: {
          prompt: imageDescription,
          apply_watermark: false
        }
      }
    ).catch((err) => {
      return new Error(String(err))
    })
    if (output instanceof Error) {
      return {
        success: false,
        error: output.message
      }
    }
    const safeParseOutput = z.array(z.string()).safeParse(output)
    if (!safeParseOutput.success) {
      return {
        success: false,
        error: 'Error on parsing output'
      }
    }
    if (safeParseOutput.data.length <= 0) {
      return {
        success: false,
        error: 'Output URL not found'
      }
    }
    const outputUrl = safeParseOutput.data[0]
    if (outputUrl.length <= 0) {
      return {
        success: false,
        error: 'Output URL not found, length <= 0'
      }
    }
    const image = await axios.get(outputUrl, { responseType: 'arraybuffer' }).catch((err) => {
      return new Error(String(err))
    })
    if (image instanceof Error) {
      return {
        success: false,
        error: image.message
      }
    }
    const imageBufferSafeParse = z.instanceof(Buffer).safeParse(image.data)
    if (!imageBufferSafeParse.success) {
      return {
        success: false,
        error: 'Error on parsing image buffer'
      }
    }
    return {
      success: true,
      imageUrl: outputUrl,
      image: imageBufferSafeParse.data
    }
  }
}
