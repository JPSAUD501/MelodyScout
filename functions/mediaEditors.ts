import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { lang } from '../translations/base'
import { type AIImageMetadata } from '../types'
import ffmpeg from 'fluent-ffmpeg'
import stream from 'stream'
import { ffConfig } from '../config'
import { temporaryDirectoryTask } from './tempy'

export async function composeImage (ctxLang: string | undefined, image: Buffer, trackName: string, artistName: string): Promise<{
  success: true
  image: Buffer
} | {
  success: false
  error: string
}> {
  const fontFilePath = path.join(__dirname, '../public/fonts/Poppins/Poppins-Regular.ttf')
  const imageFramePath = path.join(__dirname, '../public/v2/imageFrame.png')
  const textOverlay = await sharp({
    text: {
      text: lang(ctxLang, 'composeImageTitle', {
        trackName: trackName.replaceAll('&', '').replaceAll('  ', ' '),
        artistName: artistName.replaceAll('&', '').replaceAll('  ', ' ')
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
    return {
      success: false,
      error: `Error on creating text overlay: ${textOverlay.message}`
    }
  }
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
    return {
      success: false,
      error: `Error on creating final image: ${finalImage.message}`
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
  const storiesImageBackgroundRequest = sharp(image)
    .resize(1080, 1920, {
      fit: 'cover'
    })
    .blur(70)
    .ensureAlpha(0.25)
    .png()
    .toBuffer()
    .catch((err) => {
      return new Error(err)
    })
  const [storiesMainImage, storiesImageBackground] = await Promise.all([storiesMainImageRequest, storiesImageBackgroundRequest])
  if (storiesMainImage instanceof Error) {
    return {
      success: false,
      error: storiesMainImage.message
    }
  }
  if (storiesImageBackground instanceof Error) {
    return {
      success: false,
      error: storiesImageBackground.message
    }
  }
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
    return {
      success: false,
      error: storiesFinalImage.message
    }
  }
  return {
    success: true,
    storiesImage: storiesFinalImage
  }
}

export async function createStoriesVideo (image: Buffer, trackPreview: Buffer, imageMetadata: AIImageMetadata): Promise<{
  success: true
  data: {
    video: Buffer
  }
} | {
  success: false
  error: string
}> {
  try {
    const storiesImage = await composeStoryImage(image)
    if (!storiesImage.success) {
      return {
        success: false,
        error: storiesImage.error
      }
    }
    const storiesImageStream = stream.Readable.from(storiesImage.storiesImage)
    const trackPreviewStream = stream.Readable.from(trackPreview)
    ffmpeg.setFfmpegPath(ffConfig.ffmpegPath)
    ffmpeg.setFfprobePath(ffConfig.ffprobePath)
    const video: {
      inputImage: stream.Readable
      inputAudio: stream.Readable
      output: Buffer | undefined
    } = {
      inputImage: storiesImageStream,
      inputAudio: trackPreviewStream,
      output: undefined
    }
    await temporaryDirectoryTask(async (tempDir) => {
      console.log(`Temporary directory: ${tempDir}`)
      const getVideo = async (): Promise<Buffer> => {
        return await new Promise((_resolve, reject) => {
          ffmpeg(storiesImageStream)
            .outputFormat('mp4')
            .on('start', (commandLine) => {
              console.log(`ffmpeg command: ${commandLine}`)
            })
            .on('progress', (progress) => {
              console.log(`Processing: ${progress.percent}% done`)
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
        return {
          success: false,
          error: `Error on creating video: ${processVideo.message}`
        }
      }
      video.output = fs.readFileSync(path.join(tempDir, 'video.mp4'))
    })
    if (video.output === undefined) {
      return {
        success: false,
        error: 'Error on creating video: Output is undefined'
      }
    }
    return {
      success: true,
      data: {
        video: video.output
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Error on creating video: ${String(error)}`
    }
  }
}
