import { z } from 'zod'

export const zodIdentifyTrack = z.object({
  status: z.object({ version: z.string(), msg: z.string(), code: z.number() }),
  metadata: z.object({
    humming: z.array(
      z.object({
        play_offset_ms: z.number(),
        result_from: z.number(),
        external_ids: z.unknown(),
        external_metadata: z.unknown(),
        score: z.number(),
        artists: z.array(z.object({ name: z.string() })),
        title: z.string(),
        album: z.object({ name: z.string() }),
        duration_ms: z.number().optional(),
        label: z.string().optional(),
        acrid: z.string(),
        release_date: z.string().optional()
      })
    )
  }),
  cost_time: z.number()
})
export type IdentifyTrack = z.infer<typeof zodIdentifyTrack>
