import { type LyricsApiError } from './zodLyricsApiError'
import { type MsApiError } from './zodMsApiError'

export type ApiErrors = {
  success: false
  errorType: 'msApiError'
  errorData: MsApiError
} |
{
  success: false
  errorType: 'lyricsApiError'
  errorData: LyricsApiError
}
