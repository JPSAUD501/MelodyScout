import { ZodObject } from 'zod'
import { zodLfmApiError } from '../types/errors/zodLfmApiError'
import { ApiErrors } from '../types/errors/ApiErrors'

type MsApiFetchResponse = {
  success: true
  data: any
} | ApiErrors

export const msApiFetch = async (url: string, expectedZodObject: ZodObject<any>): Promise<MsApiFetchResponse> => {
  const response = await fetch(url).catch((err) => {
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
  const jsonResponse = await response.json().catch((err) => {
    return new Error(err)
  })
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
  const lfmApiError = zodLfmApiError.safeParse(jsonResponse)
  if (lfmApiError.success) {
    console.error(lfmApiError.data)
    return {
      success: false,
      errorType: 'lfmApiError',
      errorData: lfmApiError.data
    }
  }
  const expectedData = expectedZodObject.safeParse(jsonResponse)
  if (!expectedData.success) {
    console.error(expectedData.error.issues)
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
}
