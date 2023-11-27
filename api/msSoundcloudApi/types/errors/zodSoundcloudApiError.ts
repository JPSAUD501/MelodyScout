import { z } from 'zod'

export const zodSoundcloudApiError = z.object({
  message: z.string(),
  error: z.number()
})

export type SoundcloudApiError = z.infer<typeof zodSoundcloudApiError>
