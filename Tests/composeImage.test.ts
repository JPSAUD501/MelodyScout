import { test, expect } from '@jest/globals'
import { composeImage } from '../MelodyScout_Bot/botFunctions/callbacks/tracklyricsexplanation'
import fs from 'fs'
import path from 'path'

test('composeImage-DEFAULT', async () => {
  const ctxLang = undefined
  const testImagePath = path.join(__dirname, './resources/base/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await composeImage(ctxLang, testImage, 'Test Track', 'Test Artist')
  if (finalImage.success) fs.writeFileSync(path.join(__dirname, './resources/results/finalImage-DEFAULT.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
}, 15000)

test('composeImage-PTBR', async () => {
  const ctxLang = 'pt-br'
  const testImagePath = path.join(__dirname, './resources/base/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await composeImage(ctxLang, testImage, 'Test Track', 'Test Artist')
  if (finalImage.success) fs.writeFileSync(path.join(__dirname, './resources/results/finalImage-PTBR.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
}, 15000)

test('composeImage-EN', async () => {
  const ctxLang = 'en'
  const testImagePath = path.join(__dirname, './resources/base/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await composeImage(ctxLang, testImage, 'Test Track', 'Test Artist')
  if (finalImage.success) fs.writeFileSync(path.join(__dirname, './resources/results/finalImage-EN.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
}, 15000)

test('composeImage-JA', async () => {
  const ctxLang = 'ja'
  const testImagePath = path.join(__dirname, './resources/base/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await composeImage(ctxLang, testImage, 'Test Track', 'Test Artist')
  if (finalImage.success) fs.writeFileSync(path.join(__dirname, './resources/results/finalImage-JA.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
}, 15000)
