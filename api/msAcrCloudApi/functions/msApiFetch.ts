import { type ZodUnion, type ZodAny, type ZodObject, type ZodString } from 'zod'
import { type ApiErrors } from '../types/errors/ApiErrors'
import axios from 'axios'
import { zodAcrCloudApiError } from '../types/errors/zodAcrCloudApiError'
import { advLog } from '../../../functions/advancedConsole'

type MsApiFetchResponse = {
  success: true
  data: any
} | ApiErrors

export const msApiFetch = async (url: string, method: string | undefined, headers: object | undefined, data: object | undefined, expectedZod: ZodObject<any> | ZodAny | ZodString | ZodUnion<any>): Promise<MsApiFetchResponse> => {
  try {
    const response = await axios({
      method,
      headers,
      data,
      url
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
          status: {
            msg: response.message,
            code: -1
          }
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
          status: {
            msg: jsonResponse.message,
            code: -2
          }
        }
      }
    }
    const acrcloudApiError = zodAcrCloudApiError.safeParse(jsonResponse)
    if (acrcloudApiError.success) {
      return {
        success: false,
        errorType: 'acrcloudApiError',
        errorData: acrcloudApiError.data
      }
    }
    advLog(`MsAcrCloudApi - msApiFetch - ${url} - ${JSON.stringify(jsonResponse, null, 2)}`)
    const expectedData = expectedZod.safeParse(jsonResponse)
    if (!expectedData.success) {
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          status: {
            msg: expectedData.error.message,
            code: -3
          }
        }
      }
    }
    return {
      success: true,
      data: expectedData.data
    }
  } catch (err) {
    console.error(String(err))
    return {
      success: false,
      errorType: 'msApiError',
      errorData: {
        status: {
          msg: String(err),
          code: -4
        }
      }
    }
  }
}
