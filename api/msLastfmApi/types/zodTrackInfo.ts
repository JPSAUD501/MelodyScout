import { z } from 'zod'

export const zodTrackInfo = z.object({
  track: z.object({
    name: z.string(),
    mbid: z.string().optional(),
    url: z.string(),
    duration: z.string(),
    streamable: z.object({ '#text': z.string(), fulltrack: z.string() }),
    listeners: z.string(),
    playcount: z.string(),
    artist: z.object({ name: z.string(), mbid: z.string(), url: z.string() }),
    album: z.object({
      artist: z.string(),
      title: z.string(),
      mbid: z.string().optional(),
      url: z.string(),
      image: z.array(z.object({ '#text': z.string(), size: z.string() })),
      '@attr': z.object({ position: z.string() }).optional()
    }),
    userplaycount: z.string(),
    userloved: z.string(),
    toptags: z.object({
      tag: z.array(z.object({ name: z.string(), url: z.string() }))
    }),
    wiki: z.object({
      published: z.string(),
      summary: z.string(),
      content: z.string()
    }).optional()
  })
})

export type TrackInfo = z.infer<typeof zodTrackInfo>
