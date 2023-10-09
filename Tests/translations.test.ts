import { test, expect } from '@jest/globals'
import { importTranslation } from '../translations/import'
import { checkUnused } from '../translations/checkUnused'
import fs from 'fs'
import path from 'path'

test('importTranslations', async () => {
  const importTranslationResult = await importTranslation()
  if (!importTranslationResult.success) {
    throw new Error(importTranslationResult.error)
  }
  expect(importTranslationResult.success).toBe(true)
})

test('checkUnused', async () => {
  const checkUnusedKeysResult = await checkUnused()
  if (!checkUnusedKeysResult.success) {
    throw new Error(checkUnusedKeysResult.error)
  }
  fs.writeFileSync(path.join(__dirname, './resources/results/unusedKeys.json'), JSON.stringify(checkUnusedKeysResult.data.unusedKeys, null, 2))
  expect(checkUnusedKeysResult.data.unusedKeys.length).toBe(0)
})
