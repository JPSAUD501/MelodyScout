import { z } from 'zod'

export const zodTiktokTTSApi = z.object({
  success: z.boolean(),
  data: z.string().nullable(),
  error: z.string().nullable()
})

export type TiktokTTSApi = z.infer<typeof zodTiktokTTSApi>
