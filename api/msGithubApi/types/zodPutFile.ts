import { z } from 'zod'

export const zodPutFile = z.object({
  content: z.object({
    name: z.string(),
    path: z.string(),
    sha: z.string(),
    size: z.number(),
    url: z.string(),
    html_url: z.string(),
    git_url: z.string(),
    download_url: z.string(),
    type: z.string(),
    _links: z.object({ self: z.string(), git: z.string(), html: z.string() })
  }),
  commit: z.object({
    sha: z.string(),
    node_id: z.string(),
    url: z.string(),
    html_url: z.string(),
    author: z.object({ name: z.string(), email: z.string(), date: z.string() }),
    committer: z.object({
      name: z.string(),
      email: z.string(),
      date: z.string()
    }),
    tree: z.object({ sha: z.string(), url: z.string() }),
    message: z.string(),
    parents: z.array(
      z.object({ sha: z.string(), url: z.string(), html_url: z.string() })
    ),
    verification: z.object({
      verified: z.boolean(),
      reason: z.string(),
      signature: z.null(),
      payload: z.null()
    })
  })
})

export type PutFile = z.infer<typeof zodPutFile>
