import { z } from 'zod'

export const zodBochilLyricsItem = z.object({
  type: z.enum(['header', 'lyric']),
  text: z.string(),
  url: z.string().optional()
})

export const zodBochilLyricsData = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  artist: z.string(),
  album: z.string().optional(),
  albumCover: z.string().optional(),
  release: z.string().optional(),
  spotify: z.string().optional(),
  youtube: z.string().optional(),
  soundcloud: z.string().optional(),
  appleMusicPlayer: z.string().optional(),
  lyrics: z.array(zodBochilLyricsItem)
})

export type BochilLyricsData = z.infer<typeof zodBochilLyricsData>
export type BochilLyricsItem = z.infer<typeof zodBochilLyricsItem>
