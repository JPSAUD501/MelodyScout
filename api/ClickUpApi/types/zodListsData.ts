import { z } from 'zod'
import { zodListData } from './zodListData'

export const zodListsData = z.object({
  lists: z.array(zodListData)
})

export type ListsData = z.infer<typeof zodListsData>
