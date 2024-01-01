import { z } from 'zod'

export const zodLyricsFindSearchTrackData = z.object({
  tracks: z.array(
    z.object({
      score: z.number(),
      slug: z.string()
    })
  )
})

export type LyricsFindSearchTrackData = z.infer<typeof zodLyricsFindSearchTrackData>
