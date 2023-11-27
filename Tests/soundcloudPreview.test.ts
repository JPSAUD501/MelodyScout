import { test, expect } from '@jest/globals'
import fs from 'fs'
import { MsSoundcloudApi } from '../api/msSoundcloudApi/base'

test('soundcloudPreview', async () => {
  const soundcloudPreview = await new MsSoundcloudApi().preview.getFrom('Not About Love', 'AlunaGeorge')
  if (soundcloudPreview.success) {
    fs.writeFileSync('./Tests/resources/results/trackFullPreview.mp3', soundcloudPreview.data.base64FullPreview)
  }
  expect(soundcloudPreview.success).toBe(true)
}, 5000)
