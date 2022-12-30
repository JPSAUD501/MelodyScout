import { z } from 'zod'

export const zodYtSteamInfo = z.object({
  videoDetails: z.object({
    videoId: z.string(),
    title: z.string(),
    lengthSeconds: z.string(),
    keywords: z.array(z.string()).optional(),
    channelId: z.string(),
    isOwnerViewing: z.boolean(),
    shortDescription: z.string(),
    isCrawlable: z.boolean(),
    thumbnail: z.object({
      thumbnails: z.array(
        z.object({ url: z.string(), width: z.number(), height: z.number() })
      )
    }),
    allowRatings: z.boolean(),
    viewCount: z.string(),
    author: z.string(),
    isPrivate: z.boolean(),
    isUnpluggedCorpus: z.boolean(),
    isLiveContent: z.boolean()
  }),
  formats: z.array(
    z.object({
      itag: z.number(),
      mimeType: z.string(),
      bitrate: z.number(),
      width: z.number().optional(),
      height: z.number().optional(),
      initRange: z.object({ start: z.string(), end: z.string() }).optional(),
      indexRange: z.object({ start: z.string(), end: z.string() }).optional(),
      lastModified: z.string(),
      contentLength: z.string().optional(),
      quality: z.string(),
      fps: z.number().optional(),
      qualityLabel: z.string().optional(),
      projectionType: z.string(),
      audioQuality: z.string().optional(),
      averageBitrate: z.number().optional(),
      highReplication: z.boolean().optional(),
      audioSampleRate: z.string().optional(),
      audioChannels: z.number().optional(),
      loudnessDb: z.number().optional(),
      approxDurationMs: z.string().optional(),
      url: z.string()
    })
  )
})

export type YtStreamInfo = z.infer<typeof zodYtSteamInfo>
