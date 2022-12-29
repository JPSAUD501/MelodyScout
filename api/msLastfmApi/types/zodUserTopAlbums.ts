import { z } from 'zod'

export const zodUserTopAlbums = z.object({
  topalbums: z.object({
    album: z.array(
      z.object({
        artist: z.object({
          url: z.string(),
          name: z.string(),
          mbid: z.string()
        }),
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
      total: z.string(),
      perPage: z.string()
    })
  })
})

export type UserTopAlbums = z.infer<typeof zodUserTopAlbums>
