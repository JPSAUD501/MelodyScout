import Replicate from 'replicate'
import z from 'zod'
import axios from 'axios'
import { advError, advLog } from '../../functions/advancedConsole'

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
  }

  async getSdxlImage (imageDescription: string): Promise<MsReplicateGetSdxlImageResponse> {
    try {
      advLog(`MsReplicateApi - getSdxlImage - imageDescription: ${imageDescription}`)
      const model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
      const output = await this.replicate.run(
        model,
        {
          input: {
            prompt: imageDescription,
            negative_prompt: '(worst quality, low quality), tooth, open mouth,bad hand, bad fingers, lowres, bad anatomy, bad hands, error, missing fingers, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, blurry, long neck, out of frame, extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, glitchy, (((long neck))), ((flat chested)), ((((visible hand)))), ((((ugly)))), (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck))), extra heads',
            num_inference_steps: 50,
            height: 1024,
            width: 1024,
            apply_watermark: true,
            disable_safety_checker: true
          }
        }
      ).catch((err) => {
        return new Error(String(err))
      })
      if (output instanceof Error) {
        advError(`MsReplicateApi - getSdxlImage - Error on running model: ${output.message}`)
        return {
          success: false,
          error: output.message
        }
      }
      if (!('url' in output) || typeof output.url !== 'function') {
        advError('MsReplicateApi - getSdxlImage - Output does not contain URL field')
        return {
          success: false,
          error: 'Output does not contain URL field'
        }
      }
      const outputUrl = output.url()
      if (outputUrl.length <= 0) {
        advError('MsReplicateApi - getSdxlImage - Output URL not found, length <= 0')
        return {
          success: false,
          error: 'Output URL not found, length <= 0'
        }
      }
      const image = await axios.get(outputUrl, { responseType: 'arraybuffer' }).catch((err) => {
        return new Error(String(err))
      })
      if (image instanceof Error) {
        advError(`MsReplicateApi - getSdxlImage - Error on getting image: ${image.message}`)
        return {
          success: false,
          error: image.message
        }
      }
      const imageBufferSafeParse = z.instanceof(Buffer).safeParse(image.data)
      if (!imageBufferSafeParse.success) {
        advError(`MsReplicateApi - getSdxlImage - Error on parsing image buffer: ${JSON.stringify(imageBufferSafeParse.error)}`)
        return {
          success: false,
          error: 'Error on parsing image buffer'
        }
      }
      advLog(`MsReplicateApi - getSdxlImage - Success! Image URL: ${outputUrl}`)
      return {
        success: true,
        imageUrl: outputUrl,
        image: imageBufferSafeParse.data
      }
    } catch (err) {
      advError(`MsReplicateApi - getSdxlImage - Error Try Catch: ${String(err)}`)
      return {
        success: false,
        error: `Error Try Catch: ${String(err)}`
      }
    }
  }

  async getFluxImage (imageDescription: string): Promise<MsReplicateGetSdxlImageResponse> {
    try {
      advLog(`MsReplicateApi - getFluxImage - imageDescription: ${imageDescription}`)
      const model = 'black-forest-labs/flux-schnell'
      const output = await this.replicate.run(
        model,
        {
          input: {
            prompt: imageDescription,
            output_quality: 80,
            output_format: 'jpg',
            disable_safety_checker: true
          }
        }
      ).catch((err) => {
        return new Error(String(err))
      })
      if (output instanceof Error) {
        advError(`MsReplicateApi - getFluxImage - Error on running model: ${output.message}`)
        return {
          success: false,
          error: output.message
        }
      }
      if (!('url' in output) || typeof output.url !== 'function') {
        advError('MsReplicateApi - getFluxImage - Output does not contain URL field')
        return {
          success: false,
          error: 'Output does not contain URL field'
        }
      }
      const outputUrl = output.url()
      if (outputUrl.length <= 0) {
        advError('MsReplicateApi - getFluxImage - Output URL not found, length <= 0')
        return {
          success: false,
          error: 'Output URL not found, length <= 0'
        }
      }
      const image = await axios.get(outputUrl, { responseType: 'arraybuffer' }).catch((err) => {
        return new Error(String(err))
      })
      if (image instanceof Error) {
        advError(`MsReplicateApi - getFluxImage - Error on getting image: ${image.message}`)
        return {
          success: false,
          error: image.message
        }
      }
      const imageBufferSafeParse = z.instanceof(Buffer).safeParse(image.data)
      if (!imageBufferSafeParse.success) {
        advError(`MsReplicateApi - getFluxImage - Error on parsing image buffer: ${JSON.stringify(imageBufferSafeParse.error)}`)
        return {
          success: false,
          error: 'Error on parsing image buffer'
        }
      }
      advLog(`MsReplicateApi - getFluxImage - Success! Image URL: ${outputUrl}`)
      return {
        success: true,
        imageUrl: outputUrl,
        image: imageBufferSafeParse.data
      }
    } catch (err) {
      advError(`MsReplicateApi - getFluxImage - Error Try Catch: ${String(err)}`)
      return {
        success: false,
        error: `Error Try Catch: ${String(err)}`
      }
    }
  }

  async getFlux2Image (imageDescription: string): Promise<MsReplicateGetSdxlImageResponse> {
    try {
      advLog(`MsReplicateApi - getFlux2Image - imageDescription: ${imageDescription}`)
      const model = 'black-forest-labs/flux-2-dev'
      const output = await this.replicate.run(
        model,
        {
          input: {
            prompt: imageDescription,
            go_fast: true,
            aspect_ratio: '1:1',
            input_images: [],
            output_format: 'jpg',
            output_quality: 80,
            disable_safety_checker: true
          }
        }
      ).catch((err) => {
        return new Error(String(err))
      })
      if (output instanceof Error) {
        advError(`MsReplicateApi - getFlux2Image - Error on running model: ${output.message}`)
        return {
          success: false,
          error: output.message
        }
      }
      if (!('url' in output) || typeof output.url !== 'function') {
        advError('MsReplicateApi - getFlux2Image - Output does not contain URL field')
        return {
          success: false,
          error: 'Output does not contain URL field'
        }
      }
      const outputUrl = output.url()
      if (outputUrl.length <= 0) {
        advError('MsReplicateApi - getFlux2Image - Output URL not found, length <= 0')
        return {
          success: false,
          error: 'Output URL not found, length <= 0'
        }
      }
      const image = await axios.get(outputUrl, { responseType: 'arraybuffer' }).catch((err) => {
        return new Error(String(err))
      })
      if (image instanceof Error) {
        advError(`MsReplicateApi - getFlux2Image - Error on getting image: ${image.message}`)
        return {
          success: false,
          error: image.message
        }
      }
      const imageBufferSafeParse = z.instanceof(Buffer).safeParse(image.data)
      if (!imageBufferSafeParse.success) {
        advError(`MsReplicateApi - getFlux2Image - Error on parsing image buffer: ${JSON.stringify(imageBufferSafeParse.error)}`)
        return {
          success: false,
          error: 'Error on parsing image buffer'
        }
      }
      advLog(`MsReplicateApi - getFlux2Image - Success! Image URL: ${outputUrl}`)
      return {
        success: true,
        imageUrl: outputUrl,
        image: imageBufferSafeParse.data
      }
    } catch (err) {
      advError(`MsReplicateApi - getFlux2Image - Error Try Catch: ${String(err)}`)
      return {
        success: false,
        error: `Error Try Catch: ${String(err)}`
      }
    }
  }

  async getZImageTurboImage (imageDescription: string): Promise<MsReplicateGetSdxlImageResponse> {
    try {
      advLog(`MsReplicateApi - getZImageTurboImage - imageDescription: ${imageDescription}`)
      const model = 'prunaai/z-image-turbo:7ea16386290ff5977c7812e66e462d7ec3954d8e007a8cd18ded3e7d41f5d7cf'
      const output = await this.replicate.run(
        model,
        {
          input: {
            width: 1024,
            height: 1024,
            prompt: imageDescription,
            output_format: 'jpg',
            guidance_scale: 0,
            output_quality: 100,
            num_inference_steps: 10
          }
        }
      ).catch((err) => {
        return new Error(String(err))
      })
      if (output instanceof Error) {
        advError(`MsReplicateApi - getZImageTurboImage - Error on running model: ${output.message}`)
        return {
          success: false,
          error: output.message
        }
      }
      if (!('url' in output) || typeof output.url !== 'function') {
        advError('MsReplicateApi - getZImageTurboImage - Output does not contain URL field')
        return {
          success: false,
          error: 'Output does not contain URL field'
        }
      }
      const outputUrl = output.url()
      if (outputUrl.length <= 0) {
        advError('MsReplicateApi - getZImageTurboImage - Output URL not found, length <= 0')
        return {
          success: false,
          error: 'Output URL not found, length <= 0'
        }
      }
      const image = await axios.get(outputUrl, { responseType: 'arraybuffer' }).catch((err) => {
        return new Error(String(err))
      })
      if (image instanceof Error) {
        advError(`MsReplicateApi - getZImageTurboImage - Error on getting image: ${image.message}`)
        return {
          success: false,
          error: image.message
        }
      }
      const imageBufferSafeParse = z.instanceof(Buffer).safeParse(image.data)
      if (!imageBufferSafeParse.success) {
        advError(`MsReplicateApi - getZImageTurboImage - Error on parsing image buffer: ${JSON.stringify(imageBufferSafeParse.error)}`)
        return {
          success: false,
          error: 'Error on parsing image buffer'
        }
      }
      advLog(`MsReplicateApi - getZImageTurboImage - Success! Image URL: ${outputUrl}`)
      return {
        success: true,
        imageUrl: outputUrl,
        image: imageBufferSafeParse.data
      }
    } catch (err) {
      advError(`MsReplicateApi - getZImageTurboImage - Error Try Catch: ${String(err)}`)
      return {
        success: false,
        error: `Error Try Catch: ${String(err)}`
      }
    }
  }
}
