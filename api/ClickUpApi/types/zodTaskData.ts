import { any, z } from 'zod'

export const zodTaskData = z.object({
  id: z.string(),
  custom_id: z.null(),
  name: z.string(),
  text_content: z.string().nullable(),
  description: z.string().nullable(),
  status: z.object({
    status: z.string(),
    color: z.string(),
    type: z.string(),
    orderindex: z.number()
  }),
  orderindex: z.string(),
  date_created: z.string(),
  date_updated: z.string(),
  date_closed: z.string().nullable(),
  date_done: z.string().nullable(),
  archived: z.boolean(),
  creator: z.object({
    id: z.number(),
    username: z.string(),
    color: z.string(),
    email: z.string(),
    profilePicture: z.string().nullable()
  }),
  assignees: z.array(z.unknown()),
  watchers: z.array(z.unknown()),
  checklists: z.array(z.object({
    id: z.string(),
    name: z.string(),
    orderindex: z.number(),
    creator: z.number().optional(),
    resolved: z.union([z.boolean(), z.number()]),
    unresolved: z.number().optional(),
    items: z.union([
      z.array(z.object({
        id: z.string(),
        name: z.string(),
        orderindex: z.number(),
        creator: z.number().optional(),
        resolved: z.union([z.boolean(), z.number()]),
        unresolved: z.number().optional(),
        items: z.array(z.unknown()).optional()
      })),
      z.array(z.never())
    ])
  })),
  tags: z.array(z.object({
    name: z.string(),
    tag_fg: z.string(),
    tag_bg: z.string(),
    creator: z.number()
  })),
  parent: z.null(),
  priority: z.object({ priority: z.string(), color: z.string() }).nullable(),
  due_date: z.string().nullable(),
  start_date: z.string().nullable(),
  points: z.null(),
  time_estimate: z.number().nullable(),
  custom_fields: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      type_config: z.union([
        z.object({
          new_drop_down: z.boolean(),
          options: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              color: z.string(),
              orderindex: z.number()
            })
          )
        }),
        z.object({
          default: z.null(),
          precision: z.number(),
          currency_type: z.string()
        }),
        z.object({})
      ]),
      date_created: z.string(),
      hide_from_guests: z.boolean(),
      value: z.union([
        z.string(),
        z.number(),
        z.array(any()),
        z.unknown()
      ]).optional(),
      required: z.boolean()
    })
  ),
  dependencies: z.array(z.unknown()),
  linked_tasks: z.array(z.unknown()),
  team_id: z.string(),
  url: z.string(),
  permission_level: z.string().optional(),
  list: z.object({
    id: z.string(),
    name: z.string(),
    access: z.boolean()
  }),
  project: z.object({
    id: z.string(),
    name: z.string(),
    hidden: z.boolean(),
    access: z.boolean()
  }),
  folder: z.object({
    id: z.string(),
    name: z.string(),
    hidden: z.boolean(),
    access: z.boolean()
  }),
  space: z.object({ id: z.string() })
})

export type TaskData = z.infer<typeof zodTaskData>
