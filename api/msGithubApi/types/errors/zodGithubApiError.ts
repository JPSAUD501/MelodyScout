import { z } from 'zod'

export const zodGithubApiError = z.object({
  message: z.string(),
  documentation_url: z.string()
})

export type GithubApiError = z.infer<typeof zodGithubApiError>
