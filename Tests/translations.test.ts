import { test, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { updateTranslations } from '../translations/update'
import { checkUnusedKeys } from '../translations/checkUnusedKeys'

test('importTranslations', async () => {
  const updateTranslationsResult = await updateTranslations()
  if (!updateTranslationsResult.success) {
    throw new Error(updateTranslationsResult.error)
  }
  expect(updateTranslationsResult.success).toBe(true)
})

test('checkUnused', async () => {
  const checkUnusedKeysResult = await checkUnusedKeys()
  if (!checkUnusedKeysResult.success) {
    throw new Error(checkUnusedKeysResult.error)
  }
  fs.writeFileSync(path.join(__dirname, './resources/results/unusedKeys.json'), JSON.stringify(checkUnusedKeysResult.data.unusedKeys, null, 2))
  expect(checkUnusedKeysResult.data.unusedKeys.length).toBe(0)
})
