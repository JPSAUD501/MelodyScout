import { z } from 'zod'

export const zodClickUpError = z.object({
  err: z.string(),
  ECODE: z.string()
})

export type ClickUpError = z.infer<typeof zodClickUpError>
