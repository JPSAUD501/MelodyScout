import { z } from 'zod'

export const zodLfmApiError = z.object({
  message: z.string(),
  error: z.number()
})

export type LfmApiError = z.infer<typeof zodLfmApiError>
