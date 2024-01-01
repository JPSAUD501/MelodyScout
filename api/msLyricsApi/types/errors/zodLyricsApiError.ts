import { z } from 'zod'

export const zodLyricsApiError = z.object({
  status: z.object({
    msg: z.string(),
    code: z.number()
  }),
  metadata: z.undefined()
})

export type LyricsApiError = z.infer<typeof zodLyricsApiError>
