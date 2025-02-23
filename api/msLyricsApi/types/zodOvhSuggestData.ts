import { z } from 'zod'

export const zodOvhSuggestData = z.object({
  data: z.array(
    z.object({
      title: z.string(),
      artist: z.object({
        name: z.string()
      })
    })
  )
})

export type OvhSuggestData = z.infer<typeof zodOvhSuggestData>
