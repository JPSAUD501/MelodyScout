
import { GoogleApiError } from './zodGoogleApiError'
import { MsApiError } from './zodMsApiError'
import { RaveApiError } from './zodRaveApiError'

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
