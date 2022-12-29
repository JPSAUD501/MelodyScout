import { z } from 'zod'

export const zodUserTopTracks = z.object({
  toptracks: z.object({
    track: z.array(
      z.object({
        streamable: z.object({ fulltrack: z.string(), '#text': z.string() }),
        mbid: z.string(),
        name: z.string(),
        image: z.array(z.object({ size: z.string(), '#text': z.string() })),
        artist: z.object({
          url: z.string(),
          name: z.string(),
          mbid: z.string()
        }),
        url: z.string(),
        duration: z.string(),
        '@attr': z.object({ rank: z.string() }),
        playcount: z.string()
      })
    ),
    '@attr': z.object({
      user: z.string(),
      totalPages: z.string(),
      page: z.string(),
      total: z.string(),
      perPage: z.string()
    })
  })
})

export type UserTopTracks = z.infer<typeof zodUserTopTracks>
