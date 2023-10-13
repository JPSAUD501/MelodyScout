import { type UserFromGetMe } from 'grammy/types'
import { z } from 'zod'

export type GetBotInfoResponse = {
  success: false
  error: string
} | {
  success: true
  botInfo: UserFromGetMe
}

export const zodAIImageMetadata = z.object({
  version: z.literal('v1'),
  imageId: z.string(),
  trackName: z.string(),
  artistName: z.string(),
  lyrics: z.string(),
  imageDescription: z.string(),
  baseImageUrl: z.string()
})
export type AIImageMetadata = z.infer<typeof zodAIImageMetadata>
