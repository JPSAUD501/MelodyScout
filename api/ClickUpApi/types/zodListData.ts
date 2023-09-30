import { z } from 'zod'

export const zodListData = z.object({
  id: z.string(),
  name: z.string(),
  orderindex: z.number(),
  content: z.string().optional(),
  status: z.object({
    status: z.string(),
    color: z.string(),
    hide_label: z.boolean()
  }).nullable().optional(),
  priority: z.object({ priority: z.string(), color: z.string() }).nullable(),
  assignee: z.null(),
  task_count: z.number().nullable().optional(),
  due_date: z.string().nullable(),
  due_date_time: z.boolean().or(z.undefined()),
  start_date: z.null(),
  start_date_time: z.null().or(z.undefined()),
  folder: z.object({
    id: z.string(),
    name: z.string(),
    hidden: z.boolean(),
    access: z.boolean()
  }).optional(),
  space: z.object({ id: z.string(), name: z.string(), access: z.boolean() }),
  statuses: z.array(
    z.object({
      status: z.string(),
      orderindex: z.number(),
      color: z.string(),
      type: z.string()
    })
  ).optional(),
  inbound_address: z.string().optional()
})

export type ListData = z.infer<typeof zodListData>
