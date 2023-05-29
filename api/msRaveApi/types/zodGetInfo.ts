import { z } from 'zod'
import { zodRaveContent } from './zodRaveContent'

export const zodGetInfo = z.object({
  data: z.array(zodRaveContent)
})

export type GetInfo = z.infer<typeof zodGetInfo>
