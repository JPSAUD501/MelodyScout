import { randomUUID } from 'crypto'
import { MsGithubApi } from '../api/msGithubApi/base'
import { MsOpenAiApi } from '../api/msOpenAiApi/base'
import { MsReplicateApi } from '../api/msReplicateApi/base'
import { githubConfig, openaiConfig, replicateConfig } from '../config'
import { type AIImageMetadata } from '../types'
import { advError, advLog } from './advancedConsole'
import { composeImage } from './mediaEditors'

async function uploadMetadata (imageMetadata: AIImageMetadata): Promise<{
  success: true
} | {
  success: false
  error: string
}> {
  const uploadMetadataToGithub = await new MsGithubApi(githubConfig.token).files.putFile(`${imageMetadata.imageId}-${imageMetadata.version}.json`, Buffer.from(JSON.stringify(imageMetadata, null, 2)).toString('base64'))
  if (!uploadMetadataToGithub.success) {
    return {
      success: false,
      error: `Error on uploading metadata to github: ${uploadMetadataToGithub.errorData.message}`
    }
  }
  return {
    success: true
  }
}

export async function getAiImageByLyrics (ctxLang: string | undefined, lyrics: string, trackName: string, artistName: string): Promise<{
  success: true
  result: {
    withLayout: false
    imageUrl: string
  } | {
    withLayout: true
    imageUrl: string
    imageId: string
    uploadMetadataPromise: Promise<{
      success: true
    } | {
      success: false
      error: string
    }>
  }
} | {
  success: false
  error: string
}> {
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const lyricsImageDescription = await msOpenAiApi.getLyricsImageDescription(lyrics)
  if (!lyricsImageDescription.success) {
    return {
      success: false,
      error: `Error on getting image description: ${lyricsImageDescription.error}`
    }
  }
  const msReplicateApi = new MsReplicateApi(replicateConfig.token)
  const imageByDescription = await msReplicateApi.getSdxlImage(lyricsImageDescription.description)
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
  const githubApi = new MsGithubApi(githubConfig.token)
  const imageId = randomUUID()
  const uploadToGithub = await githubApi.files.putFile(`${imageId}.jpg`, finalImage.image.toString('base64'))
  if (!uploadToGithub.success) {
    advError(`Error on uploading image to github: ${uploadToGithub.errorData.message}`)
    return {
      success: true,
      result: {
        withLayout: false,
        imageUrl: imageByDescription.imageUrl
      }
    }
  }
  advLog(`New image generated for ${trackName} by ${artistName}: ${uploadToGithub.data.content.download_url}`)
  return {
    success: true,
    result: {
      withLayout: true,
      imageUrl: uploadToGithub.data.content.download_url,
      imageId,
      uploadMetadataPromise: uploadMetadata({
        version: 'v1',
        imageId,
        trackName,
        artistName,
        lyrics,
        imageDescription: lyricsImageDescription.description,
        baseImageUrl: imageByDescription.imageUrl
      })
    }
  }
}
