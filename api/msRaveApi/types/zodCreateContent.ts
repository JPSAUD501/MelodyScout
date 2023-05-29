import { z } from 'zod'
import { zodRaveContent } from './zodRaveContent'

export const zodCreateContent = z.object({
  data: zodRaveContent
})

export type CreateContent = z.infer<typeof zodCreateContent>
