import { z } from 'zod'

export const zodGoogleNewUser = z.object({
  kind: z.string(),
  idToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
  localId: z.string()
})

export type GoogleNewUser = z.infer<typeof zodGoogleNewUser>
