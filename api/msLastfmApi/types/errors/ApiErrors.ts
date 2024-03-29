import { type LfmApiError } from './zodLfmApiError'
import { type MsApiError } from './zodMsApiError'

export type ApiErrors = {
  success: false
  errorType: 'msApiError'
  errorData: MsApiError
} |
{
  success: false
  errorType: 'lfmApiError'
  errorData: LfmApiError
}
