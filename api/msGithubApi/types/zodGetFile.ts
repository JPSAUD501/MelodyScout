import { z } from 'zod'

export const zodGetFile = z.object({
  name: z.string(),
  path: z.string(),
  sha: z.string(),
  size: z.number(),
  url: z.string(),
  html_url: z.string(),
  git_url: z.string(),
  download_url: z.string(),
  type: z.string(),
  content: z.string(),
  encoding: z.string(),
  _links: z.object({ self: z.string(), git: z.string(), html: z.string() })
})

export type GetFile = z.infer<typeof zodGetFile>
