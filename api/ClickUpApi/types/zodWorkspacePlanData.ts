import { z } from 'zod'

export const zodWorkspacePlanData = z.object({
  plan_name: z.string(),
  plan_id: z.number()
})

export type WorkspacePlanData = z.infer<typeof zodWorkspacePlanData>
