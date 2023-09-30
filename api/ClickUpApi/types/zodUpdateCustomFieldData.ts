import { z } from 'zod'

export const zodUpdateCustomFieldData = z.object({})

export type UpdateCustomFieldData = z.infer<typeof zodUpdateCustomFieldData>
