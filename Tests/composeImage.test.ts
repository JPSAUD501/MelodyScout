import { expect, test } from 'vitest'
import fs from 'fs'
import path from 'path'
import { composeImage, newComposeImage } from '../functions/mediaEditors'

test('composeImage-DEFAULT', async () => {
  const ctxLang = undefined
  const testImagePath = path.join(__dirname, './resources/base/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await composeImage(ctxLang, testImage, 'Blood Sweat & Tears', 'BTS')
  if (finalImage.success) fs.writeFileSync(path.join(__dirname, './resources/results/finalImage-DEFAULT.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
}, 15000)

test('composeImage-EN', async () => {
  const ctxLang = 'en'
  const testImagePath = path.join(__dirname, './resources/base/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await composeImage(ctxLang, testImage, 'Blood Sweat & Tears', 'BTS')
  if (finalImage.success) fs.writeFileSync(path.join(__dirname, './resources/results/finalImage-EN.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
}, 15000)

test('newComposeImage-DEFAULT', async () => {
  const ctxLang = undefined
  const testImagePath = path.join(__dirname, './resources/base/image.png')
  const testImage = fs.readFileSync(testImagePath)
  const finalImage = await newComposeImage(ctxLang, testImage, 'Blood Sweat & Tears', 'BTS')
  if (finalImage.success) fs.writeFileSync(path.join(__dirname, './resources/results/newFinalImage-DEFAULT.png'), finalImage.image)
  expect(finalImage.success).toBe(true)
}, 150000)
