import { z } from "zod"

export const zodUserInfo = z.object({
  user: z.object({
    name: z.string(),
    age: z.string(),
    subscriber: z.string(),
    realname: z.string(),
    bootstrap: z.string(),
    playcount: z.string(),
    artist_count: z.string(),
    playlists: z.string(),
    track_count: z.string(),
    album_count: z.string(),
    image: z.array(z.object({ size: z.string(), "#text": z.string() })),
    registered: z.object({ unixtime: z.string(), "#text": z.number() }),
    country: z.string(),
    gender: z.string(),
    url: z.string(),
    type: z.string()
  })
})

export type UserInfo = z.infer<typeof zodUserInfo>