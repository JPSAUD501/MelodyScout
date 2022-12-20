import { z } from "zod"

export const zodAlbumInfo = z.object({
  album: z.object({
    artist: z.string(),
    mbid: z.string().optional(),
    tags: z.object({
      tag: z.array(z.object({ url: z.string(), name: z.string() }))
    }),
    name: z.string(),
    image: z.array(z.object({ size: z.string(), "#text": z.string() })),
    tracks: z.object({
      track: z.array(
        z.object({
          streamable: z.object({ fulltrack: z.string(), "#text": z.string() }),
          duration: z.number().nullable(),
          url: z.string(),
          name: z.string(),
          "@attr": z.object({ rank: z.number() }),
          artist: z.object({
            url: z.string(),
            name: z.string(),
            mbid: z.string()
          })
        })
      )
    }),
    url: z.string(),
    listeners: z.string(),
    playcount: z.string(),
    userplaycount: z.number().optional(),
    wiki: z.object({
      published: z.string(),
      summary: z.string(),
      content: z.string()
    })
  })
})

export type AlbumInfo = z.infer<typeof zodAlbumInfo>
