import { test, expect } from '@jest/globals'
import { composeImage } from '../MelodyScout_Bot/botFunctions/callbacks/tracklyricsexplanation'
import fs from 'fs'
import path from 'path'

test('composeImage', async () => {
  const testImagePath = path.join(__dirname, './resources/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await composeImage(testImage, 'Test Track', 'Test Artist')
  if (!finalImage.success) {
    throw new Error(finalImage.error)
  }
  fs.writeFileSync(path.join(__dirname, './resources/finalImage.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
})
