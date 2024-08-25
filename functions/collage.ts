import { randomUUID } from 'crypto'
import { advError, advLog } from './advancedConsole'
import { composeCollageImage } from './mediaEditors'
import { msFirebaseApi } from '../MelodyScout_Bot/bot'

export async function createCollage (ctxLang: string | undefined, tracks: Array<{
  trackName: string
  artistName: string
  trackImageUrl: string
  playcount: number
}>): Promise<{
    success: true
    result: {
      imageUrl: string
      imageId: string
    }
  } | {
    success: false
    error: string
  }> {
  const finalImage = await composeCollageImage(ctxLang, tracks)
  if (!finalImage.success) {
    advError(`Error on composing image: ${finalImage.error}`)
    return {
      success: false,
      error: finalImage.error
    }
  }
  const imageId = randomUUID()
  const uploadToFirebase = await msFirebaseApi.putFile('images/collage', `${imageId}.jpg`, finalImage.image)
  if (!uploadToFirebase.success) {
    advError(`Error on uploading image to firebase: ${uploadToFirebase.error}`)
    return {
      success: false,
      error: uploadToFirebase.error
    }
  }
  advLog(`New collage image generated for: ${tracks.map(track => `${track.trackName} - ${track.artistName}`).join(', ')}, imageId: ${imageId}`)
  return {
    success: true,
    result: {
      imageUrl: uploadToFirebase.publicUrl,
      imageId
    }
  }
}
