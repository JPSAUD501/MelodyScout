import { expect, test } from 'bun:test'
import { createStoriesVideo } from '../functions/mediaEditors'
import fs from 'fs'
import { type AIImageMetadata } from '../types'

test('createStoriesVideo-DEFAULT', async () => {
  const imageBuffer = Buffer.from(fs.readFileSync('./Tests/resources/base/editedImage.png'))
  const trackPreviewBuffer = Buffer.from(fs.readFileSync('./Tests/resources/base/trackPreview.mp3'))
  const mockMetadata: AIImageMetadata = {
    version: 'v1',
    imageId: 'TESTID123',
    trackName: 'Test Track',
    artistName: 'Test Artist',
    lyrics: '',
    imageDescription: '',
    baseImageUrl: ''
  }
  const videoResponse = await createStoriesVideo(imageBuffer, trackPreviewBuffer, mockMetadata)
  if (videoResponse.success) {
    fs.writeFileSync('./Tests/resources/results/video-DEFAULT.mp4', videoResponse.data.video)
  }
  console.log(videoResponse)
  expect(videoResponse.success).toBe(true)
}, 60000)
