import { z } from 'zod'

export const zodCreateTaskCommentData = z.object({
  id: z.number(),
  hist_id: z.string(),
  date: z.number()
})

export type CreateTaskCommentData = z.infer<typeof zodCreateTaskCommentData>
