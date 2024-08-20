import { randomUUID } from 'crypto'
// import { MsGithubApi } from '../api/msGithubApi/base'
import { MsReplicateApi } from '../api/msReplicateApi/base'
import { googleAiConfig, replicateConfig } from '../config'
import { type AIImageMetadata } from '../types'
import { advError, advLog } from './advancedConsole'
import { newComposeImage } from './mediaEditors'
import { MsGoogleAiApi } from '../api/msGoogleAiApi/base'
import { msFirebaseApi } from '../MelodyScout_Bot/bot'

// async function uploadMetadata (imageMetadata: AIImageMetadata): Promise<{
//   success: true
// } | {
//   success: false
//   error: string
// }> {
//   const uploadMetadataToGithub = await new MsGithubApi(githubConfig.token).files.putFile(`${imageMetadata.imageId}-${imageMetadata.version}.json`, Buffer.from(JSON.stringify(imageMetadata, null, 2)).toString('base64'))
//   if (!uploadMetadataToGithub.success) {
//     return {
//       success: false,
//       error: `Error on uploading metadata to github: ${uploadMetadataToGithub.errorData.message}`
//     }
//   }
//   return {
//     success: true
//   }
// }

export async function getAiImageByLyrics (ctxLang: string | undefined, lyrics: string, trackName: string, artistName: string): Promise<{
  success: true
  result: {
    withLayout: false
    imageUrl: string
  } | {
    withLayout: true
    imageUrl: string
    imageId: string
    // uploadMetadataPromise: Promise<{
    //   success: true
    // } | {
    //   success: false
    //   error: string
    // }>
  }
} | {
  success: false
  error: string
}> {
  // const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  // const openAiLyricsImageDescription = await msOpenAiApi.getLyricsImageDescription(lyrics)
  const googleAiApi = new MsGoogleAiApi(googleAiConfig.apiKey)
  const googleAiLyricsImageDescription = await googleAiApi.getLyricsImageDescription(lyrics)
  // if (!openAiLyricsImageDescription.success) {
  //   return {
  //     success: false,
  //     error: `Error on getting image description by lyrics from OpenAi: ${openAiLyricsImageDescription.error}`
  //   }
  // }
  if (!googleAiLyricsImageDescription.success) {
    return {
      success: false,
      error: `Error on getting image description by lyrics from GoogleAi: ${googleAiLyricsImageDescription.error}`
    }
  }
  advLog(`Image description by lyrics:\nGoogleAi: ${googleAiLyricsImageDescription.description}`)
  const lyricsImageDescription = googleAiLyricsImageDescription
  const msReplicateApi = new MsReplicateApi(replicateConfig.token)
  const imageByDescription = await msReplicateApi.getFluxImage(lyricsImageDescription.description)
  // const imageByDescription = await msReplicateApi.getRealvisxlImage(lyricsImageDescription.description)
  if (!imageByDescription.success) {
    return {
      success: false,
      error: `Error on getting image by description: ${imageByDescription.error}`
    }
  }
  const finalImage = await newComposeImage(ctxLang, imageByDescription.image, trackName, artistName)
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
  // const githubApi = new MsGithubApi(githubConfig.token)
  const imageId = randomUUID()
  // const uploadToGithub = await githubApi.files.putFile(`${imageId}.jpg`, finalImage.image.toString('base64'))
  // if (!uploadToGithub.success) {
  //   advError(`Error on uploading image to github: ${uploadToGithub.errorData.message}`)
  //   return {
  //     success: true,
  //     result: {
  //       withLayout: false,
  //       imageUrl: imageByDescription.imageUrl
  //     }
  //   }
  // }
  const finalImageMetadata: AIImageMetadata = {
    version: 'v1',
    imageId,
    trackName,
    artistName,
    lyrics,
    imageDescription: lyricsImageDescription.description,
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
  // advLog(`New image generated for ${trackName} by ${artistName}: ${uploadToGithub.data.content.download_url}`)
  advLog(`New image generated for ${trackName} by ${artistName}: ${uploadToFirebase.publicUrl}`)
  return {
    success: true,
    result: {
      withLayout: true,
      // imageUrl: uploadToGithub.data.content.download_url,
      imageUrl: uploadToFirebase.publicUrl,
      imageId
      // uploadMetadataPromise: uploadMetadata({
      //   version: 'v1',
      //   imageId,
      //   trackName,
      //   artistName,
      //   lyrics,
      //   imageDescription: lyricsImageDescription.description,
      //   baseImageUrl: imageByDescription.imageUrl
      // })
    }
  }
}
