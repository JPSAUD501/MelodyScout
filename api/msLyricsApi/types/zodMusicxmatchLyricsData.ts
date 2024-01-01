import { z } from 'zod'

export const zodMusicxmatchLyricsData = z.object({
  songwriters: z.string().optional(),
  title: z.string().optional(),
  artist: z.string().optional(),
  genres: z.string().optional(),
  sources: z.array(z.string()),
  lyrics: z.string()
})

export type MusicxmatchLyricsData = z.infer<typeof zodMusicxmatchLyricsData>
