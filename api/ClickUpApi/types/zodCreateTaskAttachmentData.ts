import { z } from 'zod'

export const zodCreateTaskAttachmentData = z.object({
  id: z.string(),
  version: z.string(),
  date: z.number(),
  title: z.string(),
  extension: z.string(),
  thumbnail_small: z.string().nullable(),
  thumbnail_large: z.string().nullable(),
  url: z.string()
})

export type CreateTaskAttachmentData = z.infer<typeof zodCreateTaskAttachmentData>
