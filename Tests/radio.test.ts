import { test, expect } from '@jest/globals'
import youtubedl from 'youtube-dl-exec'
import ffmpeg from 'fluent-ffmpeg'
import { ffConfig } from '../config'

test('test', async () => {
  const videoWithAudioUrlRequest = await youtubedl.exec('https://www.youtube.com/watch?v=VuyZci8QlP0', {
    format: 'best',
    skipDownload: true,
    getUrl: true,
    noWarnings: true,
    callHome: false,
    noCheckCertificates: true,
    noPart: true,
    noPlaylist: true
  }).catch((err) => {
    return new Error(String(err))
  })
  if (videoWithAudioUrlRequest instanceof Error) {
    console.log(videoWithAudioUrlRequest)
    expect(false).toBe(true)
    return
  }
  console.log(videoWithAudioUrlRequest.stdout)
  const getVideo = async (): Promise<void> => {
    await new Promise((resolve, reject) => {
      const startTime = Date.now()
      ffmpeg()
        .setFfmpegPath(ffConfig.ffmpegPath)
        .addOption('-re')
        .addOption('-i', videoWithAudioUrlRequest.stdout)
        .addOption('-sar', '1:1')
        .addOption('-vcodec', 'libx264')
        .addOption('-acodec', 'aac')
        .addOption('-f', 'flv')
        .addOption('-preset', 'ultrafast')
        .addOption('-threads', '1')
        .addOption('-strict', 'experimental')
        .save('rtmps://dc1-1.rtmp.t.me/s/1955599407:lRO3AH3qrsl95TTpT6H5sg')
        .on('start', (commandLine) => {
          console.log(' > ffmpeg process started!')
        })
        .on('end', () => {
          const endTime = Date.now()
          const duration = (endTime - startTime) / 1000
          console.log(` > ffmpeg process ended: ${duration} seconds`)
        })
        .on('error', (error) => {
          console.log(` > ffmpeg process error: ${error.message}`)
        })
    })
  }
  const processVideo = await getVideo().catch((error) => {
    return new Error(error)
  })
  if (processVideo instanceof Error) {
    console.log(processVideo)
    expect(false).toBe(true)
    return
  }
  expect(true).toBe(true)
}, 30000)
