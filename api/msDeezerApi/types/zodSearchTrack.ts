import { z } from 'zod'

export const zodSearchTrack = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      readable: z.boolean(),
      title: z.string(),
      title_short: z.string(),
      title_version: z.string(),
      link: z.string(),
      duration: z.number(),
      rank: z.number(),
      explicit_lyrics: z.boolean(),
      explicit_content_lyrics: z.number(),
      explicit_content_cover: z.number(),
      preview: z.string(),
      md5_image: z.string(),
      artist: z.object({
        id: z.number(),
        name: z.string(),
        link: z.string(),
        picture: z.string(),
        picture_small: z.string(),
        picture_medium: z.string(),
        picture_big: z.string(),
        picture_xl: z.string(),
        tracklist: z.string(),
        type: z.string()
      }),
      album: z.object({
        id: z.number(),
        title: z.string(),
        cover: z.string(),
        cover_small: z.string(),
        cover_medium: z.string(),
        cover_big: z.string(),
        cover_xl: z.string(),
        md5_image: z.string(),
        tracklist: z.string(),
        type: z.string()
      }),
      type: z.string()
    })
  ),
  total: z.number(),
  next: z.string().optional()
})

export type SearchTrack = z.infer<typeof zodSearchTrack>
