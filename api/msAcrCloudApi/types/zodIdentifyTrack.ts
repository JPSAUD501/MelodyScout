import { z } from 'zod'

export const zodAcrCloudTrack = z.object({
  release_date: z.string().optional(),
  external_metadata: z.unknown(),
  genres: z.array(z.object({ name: z.string() })).optional(),
  score: z.number(),
  title: z.string(),
  duration_ms: z.number().optional(),
  external_ids: z.unknown(),
  label: z.string().optional(),
  album: z.object({ name: z.string() }),
  artists: z.array(z.object({ name: z.string() })),
  db_end_time_offset_ms: z.number().optional(),
  sample_begin_time_offset_ms: z.number().optional(),
  sample_end_time_offset_ms: z.number().optional(),
  play_offset_ms: z.number(),
  result_from: z.number(),
  acrid: z.string(),
  db_begin_time_offset_ms: z.number()
})
export type AcrCloudTrack = z.infer<typeof zodAcrCloudTrack>

export const zodIdentifyTrack = z.object({
  result_type: z.number().optional(),
  status: z.object({ version: z.string(), msg: z.string(), code: z.number() }),
  metadata: z.object({
    humming: z.array(zodAcrCloudTrack).optional(),
    music: z.array(zodAcrCloudTrack).optional()
  }),
  cost_time: z.number()
})
export type IdentifyTrack = z.infer<typeof zodIdentifyTrack>
