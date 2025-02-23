import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { lang } from '../translations/base'
import { type AIImageMetadata } from '../types'
import ffmpeg from 'fluent-ffmpeg'
import { deleteTempDir, getTempDir } from './tempy'
import { converterApiConfig, ffConfig, melodyScoutConfig } from '../config'
import { advError, advLog } from './advancedConsole'
import { randomUUID } from 'crypto'
import * as materialUtilities from '@material/material-color-utilities'
import { MsConverterApi } from '../api/msConverterApi/base'
import { getAverageColor } from 'fast-average-color-node'
import type { CollageTrackData } from './collage'
import { getCallbackKey } from './callbackMaker'

export async function getMaterialYouColorThemeFromImage (image: Buffer): Promise<{
  success: true
  theme: materialUtilities.Theme
} | {
  success: false
  error: string
}> {
  const averageColor = await getAverageColor(image, {
    mode: 'precision',
    algorithm: 'sqrt'
  }).catch((error) => {
    return new Error(error)
  })
  if (averageColor instanceof Error) {
    advError(`MediaEditor - ComposeImage - Error on getting average color: ${averageColor.message}`)
    return {
      success: false,
      error: `Error on getting average color: ${averageColor.message}`
    }
  }
  const theme = materialUtilities.themeFromSourceColor(materialUtilities.argbFromHex(averageColor.hex))
  return {
    success: true,
    theme
  }
}

export async function composeCollageImage (ctxLang: string | undefined, tracks: CollageTrackData[]): Promise<{
  success: true
  image: Buffer
} | {
  success: false
  error: string
}> {
  const collageTracksImages: Array<{
    trackName: string
    artistName: string
    trackImageUrl: string
    fontColor: string
    containerColor: string
    playcount: number
  }> = []
  for (const track of tracks) {
    const themeResponse = await getMaterialYouColorThemeFromImage(Buffer.from(track.imageBase64, 'base64'))
    if (!themeResponse.success) {
      return {
        success: false,
        error: themeResponse.error
      }
    }
    const theme = themeResponse.theme
    const containerColor = materialUtilities.hexFromArgb(theme.schemes.light.primaryContainer)
    const fontColor = materialUtilities.hexFromArgb(theme.schemes.light.onPrimaryContainer)
    const trackAndArtistName = getCallbackKey(['JP', track.trackName.replace(/  +/g, ' '), track.artistName.replace(/  +/g, ' ')]).split(melodyScoutConfig.divider)
    collageTracksImages.push({
      trackName: trackAndArtistName[1],
      artistName: trackAndArtistName[2],
      trackImageUrl: `data:image/jpeg;base64,${track.imageBase64}`,
      fontColor,
      containerColor,
      playcount: track.playcount
    })
  }
  const html = fs.readFileSync(path.join(__dirname, '../public/v2/collageFrame.html'), 'utf8')
  const htmlWithText = html
    .replace(/\/\* {{backgroundColor}} \*\//g, `background-color: ${collageTracksImages[Math.floor(Math.random() * collageTracksImages.length)].fontColor};`)
    .replace(/{{tittle1}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[0].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[0].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter1}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[0].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image1}} \*\//g, `background-image: url("${collageTracksImages[0].trackImageUrl}");`)
    .replace(/\/\* {{containerColor1}} \*\//g, `background-color: ${collageTracksImages[0].containerColor};`)
    .replace(/\/\* {{fontColor1}} \*\//g, `color: ${collageTracksImages[0].fontColor};`)
    .replace(/{{tittle2}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[1].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[1].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter2}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[1].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image2}} \*\//g, `background-image: url("${collageTracksImages[1].trackImageUrl}");`)
    .replace(/\/\* {{containerColor2}} \*\//g, `background-color: ${collageTracksImages[1].containerColor};`)
    .replace(/\/\* {{fontColor2}} \*\//g, `color: ${collageTracksImages[1].fontColor};`)
    .replace(/{{tittle3}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[2].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[2].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter3}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[2].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image3}} \*\//g, `background-image: url("${collageTracksImages[2].trackImageUrl}");`)
    .replace(/\/\* {{containerColor3}} \*\//g, `background-color: ${collageTracksImages[2].containerColor};`)
    .replace(/\/\* {{fontColor3}} \*\//g, `color: ${collageTracksImages[2].fontColor};`)
    .replace(/{{tittle4}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[3].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[3].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter4}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[3].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image4}} \*\//g, `background-image: url("${collageTracksImages[3].trackImageUrl}");`)
    .replace(/\/\* {{containerColor4}} \*\//g, `background-color: ${collageTracksImages[3].containerColor};`)
    .replace(/\/\* {{fontColor4}} \*\//g, `color: ${collageTracksImages[3].fontColor};`)
    .replace(/{{tittle5}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[4].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[4].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter5}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[4].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image5}} \*\//g, `background-image: url("${collageTracksImages[4].trackImageUrl}");`)
    .replace(/\/\* {{containerColor5}} \*\//g, `background-color: ${collageTracksImages[4].containerColor};`)
    .replace(/\/\* {{fontColor5}} \*\//g, `color: ${collageTracksImages[4].fontColor};`)
    .replace(/{{tittle6}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[5].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[5].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter6}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[5].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image6}} \*\//g, `background-image: url("${collageTracksImages[5].trackImageUrl}");`)
    .replace(/\/\* {{containerColor6}} \*\//g, `background-color: ${collageTracksImages[5].containerColor};`)
    .replace(/\/\* {{fontColor6}} \*\//g, `color: ${collageTracksImages[5].fontColor};`)
    .replace(/{{tittle7}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[6].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[6].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter7}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[6].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image7}} \*\//g, `background-image: url("${collageTracksImages[6].trackImageUrl}");`)
    .replace(/\/\* {{containerColor7}} \*\//g, `background-color: ${collageTracksImages[6].containerColor};`)
    .replace(/\/\* {{fontColor7}} \*\//g, `color: ${collageTracksImages[6].fontColor};`)
    .replace(/{{tittle8}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[7].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[7].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter8}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[7].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image8}} \*\//g, `background-image: url("${collageTracksImages[7].trackImageUrl}");`)
    .replace(/\/\* {{containerColor8}} \*\//g, `background-color: ${collageTracksImages[7].containerColor};`)
    .replace(/\/\* {{fontColor8}} \*\//g, `color: ${collageTracksImages[7].fontColor};`)
    .replace(/{{tittle9}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: collageTracksImages[8].trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: collageTracksImages[8].artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{counter9}}/g, lang(ctxLang, { key: 'composeImageCounter', value: '<b>{{playcount}}</b> Scrobbles' }, {
      playcount: collageTracksImages[8].playcount.toLocaleString(lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }))
    }))
    .replace(/\/\* {{image9}} \*\//g, `background-image: url("${collageTracksImages[8].trackImageUrl}");`)
    .replace(/\/\* {{containerColor9}} \*\//g, `background-color: ${collageTracksImages[8].containerColor};`)
    .replace(/\/\* {{fontColor9}} \*\//g, `color: ${collageTracksImages[8].fontColor};`)
  const finalImage = await new MsConverterApi(converterApiConfig.apiKey).convertHtmlToImage(htmlWithText)
  if (!finalImage.success) {
    advError(`MediaEditor - ComposeImage - Error on creating final image: ${finalImage.error}`)
    return {
      success: false,
      error: `Error on creating final image: ${finalImage.error}`
    }
  }
  return {
    success: true,
    image: finalImage.image
  }
}

export async function composeImage (ctxLang: string | undefined, image: Buffer, trackName: string, artistName: string): Promise<{
  success: true
  image: Buffer
} | {
  success: false
  error: string
}> {
  const themeResponse = await getMaterialYouColorThemeFromImage(image)
  if (!themeResponse.success) {
    return {
      success: false,
      error: themeResponse.error
    }
  }
  const theme = themeResponse.theme
  const backgroundColor = materialUtilities.hexFromArgb(theme.schemes.light.primaryContainer)
  const textColor = materialUtilities.hexFromArgb(theme.schemes.light.onPrimaryContainer)
  const headsetColor = materialUtilities.hexFromArgb(theme.schemes.light.onPrimaryContainer)
  const html = fs.readFileSync(path.join(__dirname, '../public/v2/imageFrame.html'), 'utf8')
  const htmlWithText = html
    .replace(/{{header}}/g, lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
      trackName: trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
      artistName: artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
    }))
    .replace(/{{image}}/g, `data:image/jpeg;base64,${image.toString('base64')}`)
    .replace(/#007989/g, backgroundColor)
    .replace(/#000000/g, textColor)
    .replace(/#ffffff/g, headsetColor)
  const finalHtmlImage = await new MsConverterApi(converterApiConfig.apiKey).convertHtmlToImage(htmlWithText)
  if (!finalHtmlImage.success) {
    advError(`MediaEditor - ComposeImage - Error on creating final image: ${finalHtmlImage.error}`)
    return {
      success: false,
      error: `Error on creating final image: ${finalHtmlImage.error}`
    }
  }
  const finalImage = await sharp(finalHtmlImage.image)
    .jpeg({ mozjpeg: true })
    .toBuffer()
    .catch((err) => {
      return new Error(err)
    })
  if (finalImage instanceof Error) {
    advError(`MediaEditor - ComposeImage - Error on optimizing final image: ${finalImage.message}`)
    return {
      success: false,
      error: finalImage.message
    }
  }
  return {
    success: true,
    image: finalImage
  }
}

export async function composeStoryImage (image: Buffer): Promise<{
  success: true
  storiesImage: Buffer
} | {
  success: false
  error: string
}> {
  const startTimeMainImage = Date.now()
  const storiesMainImageRequest = sharp(image)
    .resize(1080, 1920, {
      fit: 'contain',
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0
      }
    })
    .png()
    .toBuffer()
    .catch((err) => {
      return new Error(err)
    })
    .then((image) => {
      const endTimeMainImage = Date.now()
      advLog(`MediaEditor - ComposeStoryImage - Main image created in ${(endTimeMainImage - startTimeMainImage) / 1000}s`)
      return image
    })
  const startTimeBackgroundImage = Date.now()
  const storiesImageBackgroundRequest = sharp(image)
    .resize(1080, 1920, {
      fit: 'cover'
    })
    .blur(70)
    .ensureAlpha(0.25)
    .jpeg({
      mozjpeg: true
    })
    .toBuffer()
    .catch((err) => {
      return new Error(err)
    })
    .then((image) => {
      const endTimeBackgroundImage = Date.now()
      advLog(`MediaEditor - ComposeStoryImage - Background image created in ${(endTimeBackgroundImage - startTimeBackgroundImage) / 1000}s`)
      return image
    })
  const [storiesMainImage, storiesImageBackground] = await Promise.all([storiesMainImageRequest, storiesImageBackgroundRequest])
  if (storiesMainImage instanceof Error) {
    advError(`MediaEditor - ComposeStoryImage - Error on creating main image: ${storiesMainImage.message}`)
    return {
      success: false,
      error: storiesMainImage.message
    }
  }
  if (storiesImageBackground instanceof Error) {
    advError(`MediaEditor - ComposeStoryImage - Error on creating background image: ${storiesImageBackground.message}`)
    return {
      success: false,
      error: storiesImageBackground.message
    }
  }
  const startTimeStoriesFinalImage = Date.now()
  const storiesFinalImage = await sharp(storiesImageBackground)
    .composite([{
      input: storiesMainImage,
      gravity: 'center'
    }])
    .jpeg({
      mozjpeg: true
    })
    .toBuffer()
    .catch((err) => {
      return new Error(err)
    })
  if (storiesFinalImage instanceof Error) {
    advError(`MediaEditor - ComposeStoryImage - Error on creating final image: ${storiesFinalImage.message}`)
    return {
      success: false,
      error: storiesFinalImage.message
    }
  }
  const endTimeStoriesFinalImage = Date.now()
  advLog(`MediaEditor - ComposeStoryImage - Stories final image created in ${(endTimeStoriesFinalImage - startTimeStoriesFinalImage) / 1000}s`)
  return {
    success: true,
    storiesImage: storiesFinalImage
  }
}

const videoProcessingQueue: string[] = []
export async function createStoriesVideo (storiesImage: Buffer, trackPreview: Buffer, imageMetadata: AIImageMetadata): Promise<{
  success: true
  data: {
    video: Buffer
  }
} | {
  success: false
  error: string
}> {
  const processUuid = randomUUID()
  videoProcessingQueue.push(processUuid)
  advLog(`MediaEditor - CreateStoriesVideo - Add process (${processUuid}) to queue - Track: ${imageMetadata.trackName} - Artist: ${imageMetadata.artistName} - Queue length: ${videoProcessingQueue.length}`)
  while (videoProcessingQueue[0] !== processUuid) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
  }
  videoProcessingQueue.shift()
  advLog(`MediaEditor - CreateStoriesVideo - Start process (${processUuid}) - Track: ${imageMetadata.trackName} - Artist: ${imageMetadata.artistName} - New queue length: ${videoProcessingQueue.length}`)
  try {
    const output: {
      video: Buffer | undefined
    } = {
      video: undefined
    }
    const tempDir = getTempDir()
    fs.writeFileSync(path.join(tempDir, 'image.jpg'), storiesImage)
    fs.writeFileSync(path.join(tempDir, 'trackPreview.mp3'), trackPreview)
    const getVideo = async (): Promise<Buffer> => {
      return await new Promise((resolve, reject) => {
        const startTime = Date.now()
        ffmpeg(path.join(tempDir, 'image.jpg'))
          .setFfmpegPath(ffConfig.ffmpegPath)
          .loop(10)
          .fps(30)
          .addInput(path.join(tempDir, 'trackPreview.mp3'))
          .addOption('-preset', 'ultrafast')
          .addOption('-threads', '1')
          .outputFormat('mp4')
          .on('start', (commandLine) => {
            advLog(`MediaEditor - CreateStoriesVideo - FFMPEG Start - Track: ${imageMetadata.trackName} - Artist: ${imageMetadata.artistName} - Command: ${commandLine}`)
          })
          .on('end', () => {
            const endTime = Date.now()
            advLog(`MediaEditor - CreateStoriesVideo - FFMPEG End - Track: ${imageMetadata.trackName} - Artist: ${imageMetadata.artistName} - Time: ${((endTime - startTime) / 1000).toFixed(2)}s`)
            resolve(fs.readFileSync(path.join(tempDir, 'video.mp4')))
          })
          .on('error', (error) => {
            reject(new Error(error.message))
          })
          .save(path.join(tempDir, 'video.mp4'))
      })
    }
    const processVideo = await getVideo().catch((error) => {
      return new Error(error)
    })
    if (processVideo instanceof Error) {
      deleteTempDir(tempDir)
      advError(`MediaEditor - CreateStoriesVideo - Error on creating video: ${processVideo.message}`)
      return {
        success: false,
        error: `Error on creating video: ${processVideo.message}`
      }
    }
    output.video = fs.readFileSync(path.join(tempDir, 'video.mp4'))
    deleteTempDir(tempDir)
    if (output.video === undefined) {
      advError('MediaEditor - CreateStoriesVideo - Error on creating video: Output is undefined')
      return {
        success: false,
        error: 'Error on creating video: Output is undefined'
      }
    }
    return {
      success: true,
      data: {
        video: output.video
      }
    }
  } catch (error) {
    advError(`MediaEditor - CreateStoriesVideo - Error on creating video: ${String(error)}`)
    return {
      success: false,
      error: `Error on creating video: ${String(error)}`
    }
  }
}
