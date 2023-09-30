import { z } from 'zod'

export const zodWorkspaceSeatsData = z.object({
  members: z.object({
    filled_members_seats: z.number(),
    total_member_seats: z.number(),
    empty_member_seats: z.number()
  }),
  guests: z.object({
    filled_guest_seats: z.number(),
    total_guest_seats: z.number(),
    empty_guest_seats: z.number()
  })
})

export type WorkspaceSeatsData = z.infer<typeof zodWorkspaceSeatsData>
