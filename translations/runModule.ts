import { getAllCode } from './getAllCode'
import { getAllLangKeys } from './getAllLangKeys'
import fs from 'fs'
import { updateTranslations } from './update'
import { generateBase } from './generateBase'
import path from 'path'

const jsonBaseFileDir = path.join('translations', 'base', 'MS-ptBR.json')

async function runTranslationModule (): Promise<{
  success: true
}> {
  console.log('Starting translation module...')
  const allCode = getAllCode()
  const allLangKeys = await getAllLangKeys(allCode.codeFiles)
  const oldJsonBaseFile = fs.readFileSync(jsonBaseFileDir).toString()
  const oldJsonBase = JSON.parse(oldJsonBaseFile)
  const oldJsonBaseKeys = Object.keys(oldJsonBase)
  const newJsonBaseKeys = Object.keys(allLangKeys)
  const keysInOldButNotInNew = oldJsonBaseKeys.filter((key) => !newJsonBaseKeys.includes(key))
  const keysInNewButNotInOld = newJsonBaseKeys.filter((key) => !oldJsonBaseKeys.includes(key))
  console.log(`Founded ${keysInOldButNotInNew.length} keys in old base but not in new base`)
  console.log(`Founded ${keysInNewButNotInOld.length} keys in new base but not in old base`)
  console.log('Keys in old but not in new:')
  console.log(keysInOldButNotInNew)
  console.log('Keys in new but not in old:')
  console.log(keysInNewButNotInOld)
  const finalJsonBase = { ...oldJsonBase, ...allLangKeys }
  fs.writeFileSync(jsonBaseFileDir, JSON.stringify(finalJsonBase, null, 2))
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const generateBaseResult = generateBase()
  if (!generateBaseResult.success) {
    throw new Error(generateBaseResult.error)
  }
  const updateResult = await updateTranslations()
  if (!updateResult.success) {
    throw new Error(updateResult.error)
  }
  console.log('Translation module finished!')
  return {
    success: true
  }
}

void runTranslationModule()
