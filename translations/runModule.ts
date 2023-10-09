import { checkUnusedKeys } from './checkUnusedKeys'
import { updateTranslations } from './update'

async function runTranslationModule (): Promise<{
  success: true
}> {
  const updateTranslationsResult = await updateTranslations()
  if (!updateTranslationsResult.success) {
    throw new Error(updateTranslationsResult.error)
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
  const checkUnusedKeysResult = await checkUnusedKeys()
  if (!checkUnusedKeysResult.success) {
    throw new Error(checkUnusedKeysResult.error)
  }
  return {
    success: true
  }
}

runTranslationModule().catch((error) => {
  console.error(error)
})
