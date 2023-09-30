import { ZodObject } from 'zod'
import { zodClickUpError } from '../types/errors/zodClickUpError'
import axios from 'axios'
import { ApiErrors } from '../types/errors/apiErrors'

type ClickUpApiFetchResponse = {
  success: true
  data: any
} | ApiErrors

export const ClickUpApiFetch = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: any,
  data: any,
  expectedZodObject: ZodObject<any>
): Promise<ClickUpApiFetchResponse> => {
  const response = await axios({
    method,
    url,
    headers,
    data
  }).catch((err: any) => {
    return new Error('Erro ao fazer requisição HTTP para a API do ClickUp. Informação técnica: ' + String(err))
  })
  if (response instanceof Error) {
    console.error(response)
    return {
      success: false,
      errorType: 'ClickUpApiError',
      errorData: {
        err: response.message,
        ECODE: -1
      }
    }
  }
  const jsonResponse = response.data
  if (jsonResponse instanceof Error) {
    console.error(jsonResponse)
    return {
      success: false,
      errorType: 'ClickUpApiError',
      errorData: {
        err: 'Erro ao fazer requisição HTTP para a API do ClickUp. Informação técnica: (ECODE: -2)' + String(jsonResponse.message),
        ECODE: -2
      }
    }
  }
  const clickUpError = zodClickUpError.safeParse(jsonResponse)
  if (clickUpError.success) {
    console.error(clickUpError.data)
    console.error(JSON.stringify(clickUpError.data, null, 2))
    return {
      success: false,
      errorType: 'ClickUpError',
      errorData: clickUpError.data
    }
  }

  const expectedData = expectedZodObject.safeParse(jsonResponse)
  if (!expectedData.success) {
    console.error(expectedData.error.issues)
    return {
      success: false,
      errorType: 'ClickUpApiError',
      errorData: {
        err: 'Erro ao fazer requisição HTTP para a API do ClickUp. Informação técnica: (ECODE: -3)' + String(expectedData.error.message),
        ECODE: -3
      }
    }
  }
  return {
    success: true,
    data: expectedData.data
  }
}
