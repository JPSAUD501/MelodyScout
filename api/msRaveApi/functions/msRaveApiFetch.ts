import { type ZodObject } from 'zod'
import axios from 'axios'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { zodRaveApiError } from '../types/errors/zodRaveApiError'
import { zodGoogleApiError } from '../types/errors/zodGoogleApiError'

type RaveApiFetchResponse = {
  success: true
  data: any
} | ApiErrors

export const msApiFetch = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: any,
  data: any,
  expectedZodObject: ZodObject<any>
): Promise<RaveApiFetchResponse> => {
  try {
    const response = await axios({
      method,
      url,
      headers,
      data
    }).catch((err: any) => {
      return new Error('Error while making HTTP request to the API. Technical information: ' + String(err.message))
    })
    if (response instanceof Error) {
      console.error(response)
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          error: -1,
          message: response.message
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
          error: -2,
          message: jsonResponse.message
        }
      }
    }
    const googleApiError = zodGoogleApiError.safeParse(jsonResponse)
    if (googleApiError.success) {
      console.error(googleApiError.data)
      console.error(JSON.stringify(googleApiError.data, null, 2))
      return {
        success: false,
        errorType: 'googleApiError',
        errorData: googleApiError.data
      }
    }
    const raveApiError = zodRaveApiError.safeParse(jsonResponse)
    if (raveApiError.success) {
      console.error(raveApiError.data)
      console.error(JSON.stringify(raveApiError.data, null, 2))
      return {
        success: false,
        errorType: 'raveApiError',
        errorData: raveApiError.data
      }
    }

    const expectedData = expectedZodObject.safeParse(jsonResponse)
    if (!expectedData.success) {
      console.error(expectedData.error.issues)
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          error: -3,
          message: 'Error while parsing the response from the API. Technical information: ' + JSON.stringify(expectedData.error.issues)
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
        error: -4,
        message: `Error while making HTTP request to the API. Technical information: ${String(err)}`
      }
    }
  }
}
