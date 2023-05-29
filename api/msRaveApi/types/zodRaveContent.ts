import { z } from 'zod'

export const zodRaveContent = z.object({
  artist: z.string(),
  createdAt: z.number(),
  dj: z.object({
    avatar: z.object({ default: z.string() }).optional(),
    createdAt: z.number(),
    displayName: z.string(),
    firebaseId: z.string(),
    id: z.string(),
    metrics: z.object({ totalViews: z.string() }),
    permission: z.string(),
    registrationComplete: z.boolean(),
    updatedAt: z.number(),
    userName: z.string()
  }),
  djReactions: z.array(z.unknown()).optional(),
  duration: z.number(),
  id: z.string(),
  media: z.array(z.unknown()),
  metrics: z.object({ totalViews: z.string().optional() }),
  percentageComplete: z.number(),
  permission: z.string(),
  reactions: z.unknown(),
  stage: z.string(),
  style: z.string(),
  thumbnails: z.object({
    180: z.string().optional(),
    720: z.string().optional(),
    default: z.string().optional()
  }),
  timeEstimate: z.number(),
  title: z.string(),
  updatedAt: z.number(),
  urls: z.object({
    720: z.string().optional(),
    default: z.string().optional(),
    audio: z.string().optional()
  }),
  viewCount: z.number()
})

export type RaveContent = z.infer<typeof zodRaveContent>
