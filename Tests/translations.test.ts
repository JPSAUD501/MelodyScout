import { test, expect } from '@jest/globals'
import { importTranslation } from '../translations/import'

test('importTranslations', async () => {
  const importTranslationResult = await importTranslation()
  expect(importTranslationResult.success).toBe(true)
})

test('checkUnusedKeys', async () => {
  // TODO: Check all code for unused lang keys
  expect(true).toBe(true)
})
