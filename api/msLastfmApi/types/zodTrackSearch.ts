import { z } from 'zod'

export const zodTrackSearch = z.object({
  results: z.object({
    'opensearch:Query': z.object({
      '#text': z.string(),
      role: z.string(),
      startPage: z.string()
    }),
    'opensearch:totalResults': z.string(),
    'opensearch:startIndex': z.string(),
    'opensearch:itemsPerPage': z.string(),
    trackmatches: z.object({
      track: z.array(
        z.object({
          name: z.string(),
          artist: z.string(),
          url: z.string(),
          streamable: z.string(),
          listeners: z.string(),
          image: z.array(z.object({ '#text': z.string(), size: z.string() })),
          mbid: z.string()
        })
      )
    }),
    '@attr': z.object({})
  })
})

export type TrackSearch = z.infer<typeof zodTrackSearch>
