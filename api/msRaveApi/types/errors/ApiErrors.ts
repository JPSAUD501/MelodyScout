import { type GoogleApiError } from './zodGoogleApiError'
import { type MsApiError } from './zodMsApiError'
import { type RaveApiError } from './zodRaveApiError'

export type ApiErrors = {
  success: false
  errorType: 'msApiError'
  errorData: MsApiError
} |
{
  success: false
  errorType: 'raveApiError'
  errorData: RaveApiError
} |
{
  success: false
  errorType: 'googleApiError'
  errorData: GoogleApiError
}
