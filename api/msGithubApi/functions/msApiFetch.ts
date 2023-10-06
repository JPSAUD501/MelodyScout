import { type ZodAny, type ZodObject, type ZodString } from 'zod'
import { type ApiErrors } from '../types/errors/ApiErrors'
import axios from 'axios'
import { zodGithubApiError } from '../types/errors/zodGithubApiError'

type MsApiFetchResponse = {
  success: true
  data: any
} | ApiErrors

export const msApiFetch = async (url: string, method: string | undefined, headers: object | undefined, data: object | undefined, expectedZod: ZodObject<any> | ZodAny | ZodString): Promise<MsApiFetchResponse> => {
  const response = await axios({
    method,
    headers,
    data,
    url
  }).catch((err: any) => {
    if (err.response.status === 404) {
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
  const githubApiError = zodGithubApiError.safeParse(jsonResponse)
  if (githubApiError.success) {
    return {
      success: false,
      errorType: 'githubApiError',
      errorData: githubApiError.data
    }
  }
  const expectedData = expectedZod.safeParse(jsonResponse)
  if (!expectedData.success) {
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
