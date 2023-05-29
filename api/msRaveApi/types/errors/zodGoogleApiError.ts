import { z } from 'zod'

export const zodGoogleApiError = z.object({
  error: z.object({
    error: z.object({
      code: z.number(),
      message: z.string(),
      errors: z.any(),
      status: z.string(),
      details: z.any()
    })
  })
})

export type GoogleApiError = z.infer<typeof zodGoogleApiError>
