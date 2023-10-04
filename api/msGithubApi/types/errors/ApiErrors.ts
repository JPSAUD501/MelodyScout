import { GithubApiError } from './zodGithubApiError'
import { MsApiError } from './zodMsApiError'

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
