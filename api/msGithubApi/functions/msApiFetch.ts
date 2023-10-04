import { ZodObject } from 'zod'
import { ApiErrors } from '../types/errors/ApiErrors'
import axios from 'axios'
import { zodGithubApiError } from '../types/errors/zodGithubApiError'

type MsApiFetchResponse = {
  success: true
  data: any
} | ApiErrors

export const msApiFetch = async (url: string, method: string, expectedZodObject: ZodObject<any>): Promise<MsApiFetchResponse> => {
  const response = await axios({
    method,
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
    console.error(githubApiError.data)
    console.error(JSON.stringify(githubApiError.data, null, 2))
    return {
      success: false,
      errorType: 'githubApiError',
      errorData: githubApiError.data
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
}
