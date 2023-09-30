import { z } from 'zod'

export const zodSpaceData = z.object({
  id: z.string(),
  name: z.string(),
  private: z.boolean(),
  statuses: z.array(
    z.object({
      status: z.string(),
      type: z.string(),
      orderindex: z.number(),
      color: z.string()
    })
  ),
  multiple_assignees: z.boolean(),
  features: z.object({
    due_dates: z.object({
      enabled: z.boolean(),
      start_date: z.boolean(),
      remap_due_dates: z.boolean(),
      remap_closed_due_date: z.boolean()
    }),
    time_tracking: z.object({ enabled: z.boolean() }),
    tags: z.object({ enabled: z.boolean() }),
    time_estimates: z.object({ enabled: z.boolean() }),
    checklists: z.object({ enabled: z.boolean() }),
    custom_fields: z.object({ enabled: z.boolean() }),
    remap_dependencies: z.object({ enabled: z.boolean() }),
    dependency_warning: z.object({ enabled: z.boolean() }),
    portfolios: z.object({ enabled: z.boolean() })
  })
})

export type SpaceData = z.infer<typeof zodSpaceData>
