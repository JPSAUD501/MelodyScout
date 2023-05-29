import { z } from 'zod'

export const zodRaveApiError = z.object({
  error: z.object({
    code: z.number(),
    message: z.string()
  })
})

export type RaveApiError = z.infer<typeof zodRaveApiError>
