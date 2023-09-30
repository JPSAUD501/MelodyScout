import { z } from 'zod'
import { zodFolderData } from './zodFolderData'

export const zodFoldersData = z.object({
  folders: z.array(zodFolderData)
})

export type FoldersData = z.infer<typeof zodFoldersData>
