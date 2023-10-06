import { type GithubApiError } from './zodGithubApiError'
import { type MsApiError } from './zodMsApiError'

export type ApiErrors = {
  success: false
  errorType: 'msApiError'
  errorData: MsApiError
} |
{
  success: false
  errorType: 'githubApiError'
  errorData: GithubApiError
}
