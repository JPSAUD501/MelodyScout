import { z } from 'zod'

export const zodAddTagToTaskData = z.object({})

export type AddTagToTaskData = z.infer<typeof zodAddTagToTaskData>
