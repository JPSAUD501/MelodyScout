import { z } from 'zod'
import { zodListData } from './zodListData'

export const zodFolderData = z.object({
  id: z.string(),
  name: z.string(),
  orderindex: z.number(),
  override_statuses: z.boolean(),
  hidden: z.boolean(),
  space: z.object({
    id: z.string(),
    name: z.string(),
    access: z.boolean().optional()
  }),
  task_count: z.string(),
  lists: z.array(zodListData)
})

export type FolderData = z.infer<typeof zodFolderData>
