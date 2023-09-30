import { z } from 'zod'
import { zodTaskData } from './zodTaskData'

export const zodTasksDataResponse = z.object({
  tasks: z.array(zodTaskData)
})

export type TasksData = z.infer<typeof zodTasksDataResponse>
