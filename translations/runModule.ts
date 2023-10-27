import { generateBaseType } from './generateBaseType'
import { updateTranslations } from './update'

async function runTranslationModule (): Promise<{
  success: true
}> {
  const generateBaseTypeResult = generateBaseType()
  if (!generateBaseTypeResult.success) {
    throw new Error(generateBaseTypeResult.error)
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
  const updateTranslationsResult = await updateTranslations()
  if (!updateTranslationsResult.success) {
    throw new Error(updateTranslationsResult.error)
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    success: true
  }
}

runTranslationModule().catch((error) => {
  console.error(error)
})
