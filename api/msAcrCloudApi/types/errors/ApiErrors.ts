import { type AcrCloudApiError } from './zodAcrCloudApiError'
import { type MsApiError } from './zodMsApiError'

export type ApiErrors = {
  success: false
  errorType: 'msApiError'
  errorData: MsApiError
} |
{
  success: false
  errorType: 'acrcloudApiError'
  errorData: AcrCloudApiError
}
