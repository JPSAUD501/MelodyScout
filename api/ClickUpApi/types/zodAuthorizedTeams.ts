import { z } from 'zod'

export const zodAuthorizedTeamsData = z.object({
  teams: z.array(
    z.object({
      id: z.string(),
      name: z.string().nullable(),
      color: z.string().nullable(),
      avatar: z.string().nullable(),
      members: z.array(
        z.object({
          user: z.object({
            id: z.number(),
            username: z.string().nullable(),
            email: z.string(),
            color: z.string().nullable(),
            profilePicture: z.string().nullable(),
            initials: z.string(),
            role: z.number(),
            custom_role: z.null(),
            last_active: z.string().nullable(),
            date_joined: z.string().nullable(),
            date_invited: z.string()
          }),
          invited_by: z.object({
            id: z.number(),
            username: z.string(),
            color: z.string(),
            email: z.string(),
            initials: z.string(),
            profilePicture: z.string().nullable()
          }).optional(),
          can_see_time_spent: z.boolean().nullable().optional(),
          can_see_time_estimated: z.boolean().nullable().optional(),
          can_see_points_estimated: z.boolean().nullable().optional(),
          can_edit_tags: z.boolean().nullable().optional(),
          can_create_views: z.boolean().nullable().optional()
        })
      )
    })
  )
})

export type AuthorizedTeamsData = z.infer<typeof zodAuthorizedTeamsData>
