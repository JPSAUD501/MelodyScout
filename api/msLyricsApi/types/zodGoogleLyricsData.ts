import { z } from 'zod'

export const zodGoogleLyricsData = z.object({
  songwriters: z.string().optional(),
  title: z.string().optional(),
  artist: z.string().optional(),
  genres: z.string().optional(),
  sources: z.array(z.string()),
  lyrics: z.string()
})

export type GoogleLyricsData = z.infer<typeof zodGoogleLyricsData>
