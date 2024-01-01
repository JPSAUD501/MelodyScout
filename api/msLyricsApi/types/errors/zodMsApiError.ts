import { z } from 'zod'

export const zodMsApiError = z.object({
  status: z.object({
    msg: z.string(),
    code: z.union([
      z.literal(-1),
      z.literal(-2),
      z.literal(-3),
      z.literal(-4),
      z.literal(-5),
      z.literal(-6)
    ])
  })
})

export type MsApiError = z.infer<typeof zodMsApiError>
