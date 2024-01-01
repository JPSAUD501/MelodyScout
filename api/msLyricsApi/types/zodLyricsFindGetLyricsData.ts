import { z } from 'zod'

export const zodLyricsFindGetLyricsData = z.object({
  pageProps: z.object({
    songData: z.object({
      track: z.object({
        lyrics: z.string()
      })
    })
  })
})

export type LyricsFindGetLyricsData = z.infer<typeof zodLyricsFindGetLyricsData>
