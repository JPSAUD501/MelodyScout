import { z } from 'zod'

export const zodOvhLyricsData = z.object({
  lyrics: z.string()
})

export type OvhLyricsData = z.infer<typeof zodOvhLyricsData>
