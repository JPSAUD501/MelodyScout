import { randomUUID } from 'crypto'
import { MsReplicateApi } from '../api/msReplicateApi/base'
import { replicateConfig } from '../config'
import { type AIImageMetadata } from '../types'
import { advError, advLog } from './advancedConsole'
import { composeImage } from './mediaEditors'
import { msFirebaseApi } from '../MelodyScout_Bot/bot'

export async function getAiImageByLyrics (ctxLang: string | undefined, lyrics: string, lyricsRepresentationImageDescription: string, trackName: string, artistName: string): Promise<{
  success: true
  result: {
    withLayout: false
    imageUrl: string
  } | {
    withLayout: true
    imageUrl: string
    imageId: string
  }
} | {
  success: false
  error: string
}> {
  const msReplicateApi = new MsReplicateApi(replicateConfig.token)
  const imageByDescription = await msReplicateApi.getFluxImage(lyricsRepresentationImageDescription)
  if (!imageByDescription.success) {
    return {
      success: false,
      error: `Error on getting image by description: ${imageByDescription.error}`
    }
  }
  const finalImage = await composeImage(ctxLang, imageByDescription.image, trackName, artistName)
  if (!finalImage.success) {
    advError(`Error on composing image: ${finalImage.error}`)
    return {
      success: true,
      result: {
        withLayout: false,
        imageUrl: imageByDescription.imageUrl
      }
    }
  }
  const imageId = randomUUID()
  const finalImageMetadata: AIImageMetadata = {
    version: 'v1',
    imageId,
    trackName,
    artistName,
    lyrics,
    imageDescription: lyricsRepresentationImageDescription,
    baseImageUrl: imageByDescription.imageUrl
  }
  const uploadToFirebase = await msFirebaseApi.putFile('images/ai', `${imageId}.jpg`, finalImage.image, finalImageMetadata)
  if (!uploadToFirebase.success) {
    advError(`Error on uploading image to firebase: ${uploadToFirebase.error}`)
    return {
      success: true,
      result: {
        withLayout: false,
        imageUrl: imageByDescription.imageUrl
      }
    }
  }
  advLog(`New image generated for ${trackName} by ${artistName}: ${uploadToFirebase.publicUrl}`)
  return {
    success: true,
    result: {
      withLayout: true,
      imageUrl: uploadToFirebase.publicUrl,
      imageId
    }
  }
}
