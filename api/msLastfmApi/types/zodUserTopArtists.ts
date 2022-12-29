import { z } from 'zod'

export const zodUserTopArtists = z.object({
  topartists: z.object({
    artist: z.array(
      z.object({
        streamable: z.string(),
        image: z.array(z.object({ size: z.string(), '#text': z.string() })),
        mbid: z.string(),
        url: z.string(),
        playcount: z.string(),
        '@attr': z.object({ rank: z.string() }),
        name: z.string()
      })
    ),
    '@attr': z.object({
      user: z.string(),
      totalPages: z.string(),
      page: z.string(),
      perPage: z.string(),
      total: z.string()
    })
  })
})

export type UserTopArtists = z.infer<typeof zodUserTopArtists>
