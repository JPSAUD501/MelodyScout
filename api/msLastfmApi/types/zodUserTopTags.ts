import { z } from 'zod'

export const zodUserTopTags = z.object({
  toptags: z.object({
    tag: z.array(
      z.object({ name: z.string(), count: z.string(), url: z.string() })
    ),
    '@attr': z.object({ user: z.string() })
  })
})

export type UserTopTags = z.infer<typeof zodUserTopTags>
