import { z } from 'zod'

export const zodUserRecentTracks = z.object({
  recenttracks: z.object({
    track: z.array(
      z.object({
        artist: z.object({
          url: z.string(),
          name: z.string(),
          image: z.array(z.object({ size: z.string(), '#text': z.string() })),
          mbid: z.string()
        }),
        mbid: z.string(),
        name: z.string(),
        image: z.array(z.object({ size: z.string(), '#text': z.string() })),
        streamable: z.string(),
        album: z.object({ mbid: z.string(), '#text': z.string() }),
        url: z.string(),
        '@attr': z.object({ nowplaying: z.string() }).optional(),
        loved: z.string()
      })
    ),
    '@attr': z.object({
      perPage: z.string(),
      totalPages: z.string(),
      page: z.string(),
      user: z.string(),
      total: z.string()
    })
  })
})

export type UserRecentTracks = z.infer<typeof zodUserRecentTracks>
