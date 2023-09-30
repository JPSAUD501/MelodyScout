import { z } from 'zod'

export const zodClickUpApiError = z.object({
  err: z.string(),
  ECODE: z.union([
    z.literal(-1),
    z.literal(-2),
    z.literal(-3),
    z.literal(-4)
  ])
})

export type ClickUpApiError = z.infer<typeof zodClickUpApiError>
