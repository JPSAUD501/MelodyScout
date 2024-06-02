import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { lang } from '../translations/base'
import { type AIImageMetadata } from '../types'
import ffmpeg from 'fluent-ffmpeg'
import { deleteTempDir, getTempDir } from './tempy'
import { converterApiConfig, ffConfig } from '../config'
import { advError, advLog } from './advancedConsole'
import { randomUUID } from 'crypto'
import * as materialUtilities from '@material/material-color-utilities'
import getPixels from 'get-pixels'
import { extractColors } from 'extract-colors'
import { MsConverterApi } from '../api/msConverterApi/base'

export async function newComposeImage (ctxLang: string | undefined, image: Buffer, trackName: string, artistName: string): Promise<{
  success: true
  image: Buffer
} | {
  success: false
  error: string
}> {
  const getPixelsFunction = async (image: Buffer): Promise<{ data: Uint8Array, width: number, height: number }> => {
    return await new Promise((resolve, reject) => {
      getPixels(image, 'image/png', (err, pixels) => {
        if (err !== null) {
          reject(err)
          return
        }
        resolve({
          data: pixels.data,
          width: pixels.shape[0],
          height: pixels.shape[1]
        })
      })
    })
  }
  const pixels = await getPixelsFunction(image).catch((error) => {
    return new Error(error)
  })
  if (pixels instanceof Error) {
    advError(`MediaEditor - ComposeImage - Error on getting pixels: ${pixels.message}`)
    return {
      success: false,
      error: `Error on getting pixels: ${pixels.message}`
    }
  }
  const colors = await extractColors({
    data: new Uint8ClampedArray(pixels.data),
    width: pixels.width,
    height: pixels.height
  }).catch((error) => {
    return new Error(error)
  })
  if (colors instanceof Error) {
    advError(`MediaEditor - ComposeImage - Error on extracting colors: ${colors.message}`)
    return {
      success: false,
      error: `Error on extracting colors: ${colors.message}`
    }
  }
  const theme = materialUtilities.themeFromSourceColor(materialUtilities.argbFromHex(colors[0].hex))
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
  const fontFilePath = path.join(__dirname, '../public/fonts/Poppins/Poppins-Regular.ttf')
  const imageFramePath = path.join(__dirname, '../public/v2/imageFrame.png')
  const startTimeTextOverlay = Date.now()
  const textOverlay = await sharp({
    text: {
      text: lang(ctxLang, { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' }, {
        trackName: trackName.replace(/&/g, '').replace(/ {2}/g, ' '),
        artistName: artistName.replace(/&/g, '').replace(/ {2}/g, ' ')
      }),
      fontfile: fontFilePath,
      font: 'Poppins',
      height: 27,
      width: 906,
      rgba: true,
      wrap: 'none'
    }
  }).resize({
    height: 27,
    width: 906,
    fit: 'contain',
    background: {
      r: 0,
      g: 0,
      b: 0,
      alpha: 0
    }
  }).webp().toBuffer().catch((error) => {
    return new Error(error)
  })
  if (textOverlay instanceof Error) {
    advError(`MediaEditor - ComposeImage - Error on creating text overlay: ${textOverlay.message}`)
    return {
      success: false,
      error: `Error on creating text overlay: ${textOverlay.message}`
    }
  }
  const endTimeTextOverlay = Date.now()
  advLog(`MediaEditor - ComposeImage - Text overlay created in ${(endTimeTextOverlay - startTimeTextOverlay) / 1000}s`)
  const startTimeFinalImage = Date.now()
  const finalImage = await sharp(image)
    .resize(1000, 1000)
    .composite([
      { input: fs.readFileSync(imageFramePath) },
      {
        input: textOverlay,
        top: 45,
        left: (1000 - 906) / 2
      }
    ])
    .jpeg({
      mozjpeg: true
    })
    .toBuffer()
    .catch((error) => {
      return new Error(error)
    })
  if (finalImage instanceof Error) {
    advError(`MediaEditor - ComposeImage - Error on creating final image: ${finalImage.message}`)
    return {
      success: false,
      error: `Error on creating final image: ${finalImage.message}`
    }
  }
  const endTimeFinalImage = Date.now()
  advLog(`MediaEditor - ComposeImage - Final image created in ${(endTimeFinalImage - startTimeFinalImage) / 1000}s`)
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
            reject(new Error(error))
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
