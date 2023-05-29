import { z } from 'zod'
import { zodRaveContent } from './zodRaveContent'

export const zodGetContent = z.object({
  data: z.array(zodRaveContent)
})

export type GetContent = z.infer<typeof zodGetContent>
