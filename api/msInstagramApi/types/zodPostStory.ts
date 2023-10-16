import { z } from 'zod'

export const zodPostStory = z.object({
  media: z.object({
    pk: z.string()
  })
})

export type PostStory = z.infer<typeof zodPostStory>
