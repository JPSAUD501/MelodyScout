import { type ZodObject } from 'zod'
import { zodSoundcloudApiError } from '../types/errors/zodSoundcloudApiError'
import { type ApiErrors } from '../types/errors/ApiErrors'
import axios from 'axios'

type MsApiFetchResponse = {
  success: true
  data: any
} | ApiErrors

export const msApiFetch = async (url: string, expectedZodObject: ZodObject<any>): Promise<MsApiFetchResponse> => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      timeout: 5000
    }).catch((err: any) => {
      if (err?.response?.status === 404) {
        return err.response.data
      }
      return new Error(err)
    })
    if (response instanceof Error) {
      console.error(response)
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          message: response.message,
          error: -1
        }
      }
    }
    const jsonResponse = response.data
    if (jsonResponse instanceof Error) {
      console.error(jsonResponse)
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          message: jsonResponse.message,
          error: -2
        }
      }
    }
    const soundcloudApiError = zodSoundcloudApiError.safeParse(jsonResponse)
    if (soundcloudApiError.success) {
      console.error(soundcloudApiError.data)
      console.error(JSON.stringify(soundcloudApiError.data, null, 2))
      return {
        success: false,
        errorType: 'soundcloudApiError',
        errorData: soundcloudApiError.data
      }
    }
    const expectedData = expectedZodObject.safeParse(jsonResponse)
    if (!expectedData.success) {
      console.error(expectedData.error.issues)
      console.error(JSON.stringify(expectedData.error.issues, null, 2))
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          message: expectedData.error.message,
          error: -3
        }
      }
    }
    return {
      success: true,
      data: expectedData.data
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      errorType: 'msApiError',
      errorData: {
        message: String(err),
        error: -4
      }
    }
  }
}
