import { type SoundcloudApiError } from './zodSoundcloudApiError'
import { type MsApiError } from './zodMsApiError'

export type ApiErrors = {
  success: false
  errorType: 'msApiError'
  errorData: MsApiError
} |
{
  success: false
  errorType: 'soundcloudApiError'
  errorData: SoundcloudApiError
}
