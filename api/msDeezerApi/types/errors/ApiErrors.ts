import { type DeezerApiError } from './zodDeezerApiError'
import { type MsApiError } from './zodMsApiError'

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
