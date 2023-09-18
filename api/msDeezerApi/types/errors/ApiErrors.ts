import { DeezerApiError } from './zodDeezerApiError'
import { MsApiError } from './zodMsApiError'

export type ApiErrors = {
  success: false
  errorType: 'msApiError'
  errorData: MsApiError
} |
{
  success: false
  errorType: 'deezerApiError'
  errorData: DeezerApiError
}
