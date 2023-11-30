import { z } from 'zod'

export const zodAcrCloudApiError = z.object({
  status: z.object({
    msg: z.string(),
    code: z.number()
  }),
  metadata: z.undefined()
})

export type AcrCloudApiError = z.infer<typeof zodAcrCloudApiError>
