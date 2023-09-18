import { z } from 'zod'

export const zodDeezerApiError = z.object({
  message: z.string(),
  error: z.number()
})

export type DeezerApiError = z.infer<typeof zodDeezerApiError>
