import fs from 'fs'
import path from 'path'
import { enUS } from './languages/enUS'
import { jaJP } from './languages/jaJP'
import { ptBR } from './languages/ptBR'

export async function checkUnusedKeys (): Promise<{
  success: true
  data: {
    unusedKeys: string[]
  }
} | {
  success: false
  error: string
}> {
  const allLangs = [...Object.keys(enUS), ...Object.keys(jaJP), ...Object.keys(ptBR)]
  const allKeys = [...new Set(allLangs)]
  const unusedKeys: string[] = []
  const allCodeArray: string[] = []
  const codeFolders = ['MelodyScout_Bot', 'functions', 'api']
  for (const codeFolder of codeFolders) {
    const rootFolder = `${codeFolder}`
    const allFiles: string[] = []
    const allFolders: Array<{ folder: string, parent: string }> = [{ folder: rootFolder, parent: '' }]
    while (allFolders.length > 0) {
      const folder = allFolders.shift()
      if (folder === undefined) continue
      const files = fs.readdirSync(path.join(folder.parent, folder.folder))
      for (const file of files) {
        if (file.endsWith('.ts')) {
          allFiles.push(path.join(folder.parent, folder.folder, file))
        }
        if (!file.includes('.')) {
          allFolders.push({ folder: file, parent: path.join(folder.parent, folder.folder) })
        }
      }
    }
    for (const file of allFiles) {
      const content = fs.readFileSync(`${file}`).toString()
      allCodeArray.push(content)
    }
  }
  const allCode = allCodeArray.join('')
  console.log(`Checking ${allCode.length} characters of code for unused translations...`)
  const allKeysUsed: string[] = []
  // Example: lang('en', 'trackLyricsExplanation', { trackName: track.name, artistName: artist.name })
  const allLangFunctions = allCode.split('lang(')
  allLangFunctions.shift()
  for (const langFunction of allLangFunctions) {
    const langKey = langFunction.split(/,|\)/)[1].replace(/'/g, '').replace(/"/g, '').trim()
    allKeysUsed.push(langKey)
  }
  const allUniqueKeysUsed = [...new Set(allKeysUsed)]
  for (const key of allUniqueKeysUsed) {
    if (!allKeys.includes(key)) {
      return {
        success: false,
        error: `The key ${key} was not found in any language!`
      }
    }
  }
  for (const key of allKeys) {
    if (!allUniqueKeysUsed.includes(key)) {
      unusedKeys.push(key)
    }
  }
  console.log(`Found ${unusedKeys.length} unused translations`)
  console.log(unusedKeys)
  return {
    success: true,
    data: {
      unusedKeys
    }
  }
}
