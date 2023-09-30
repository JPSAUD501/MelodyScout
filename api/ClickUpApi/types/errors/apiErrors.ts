import { ClickUpApiError } from './zodClickUpApiError'
import { ClickUpError } from './zodClickUpError'

export type ApiErrors = {
  success: false
  errorType: 'ClickUpApiError'
  errorData: ClickUpApiError
} |
{
  success: false
  errorType: 'ClickUpError'
  errorData: ClickUpError
}
