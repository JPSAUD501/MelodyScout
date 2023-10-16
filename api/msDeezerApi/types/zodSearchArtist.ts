import { z } from 'zod'

export const zodSearchArtist = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      link: z.string(),
      picture: z.string(),
      picture_small: z.string(),
      picture_medium: z.string(),
      picture_big: z.string(),
      picture_xl: z.string(),
      nb_album: z.number(),
      nb_fan: z.number(),
      radio: z.boolean(),
      tracklist: z.string(),
      type: z.string()
    })
  ),
  total: z.number(),
  next: z.string()
})

export type SearchArtist = z.infer<typeof zodSearchArtist>
