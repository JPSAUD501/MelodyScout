import fs from 'fs'
import path from 'path'

export async function getAllKeys (): Promise<{
  success: true
  data: {
    keys: string[]
  }
} | {
  success: false
  error: string
}> {
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
  const allCode = allCodeArray.join('\n')
  const allCodeLines = allCode.split('\n')
  const allCodeParsedArray: string[] = []
  for (const line of allCodeLines) {
    if (line.trim().startsWith('//')) continue
    allCodeParsedArray.push(line)
  }
  const allCodeParsed = allCodeParsedArray.join('\n')
  console.log(`Checking ${allCodeParsed.length} characters of code for unused translations...`)
  const allKeysUsed: string[] = []
  // Example: lang('en', 'trackLyricsExplanation', { trackName: track.name, artistName: artist.name })
  const allLangFunctions = allCodeParsed.split('lang(')
  allLangFunctions.shift()
  for (const langFunction of allLangFunctions) {
    const langKey = langFunction.split(/,|\)/)[1].replace(/'/g, '').replace(/"/g, '').trim()
    allKeysUsed.push(langKey)
  }
  const allUniqueKeysUsed = [...new Set(allKeysUsed)]
  console.log(`Found ${allUniqueKeysUsed.length} unique keys used in code!`)
  return {
    success: true,
    data: {
      keys: allUniqueKeysUsed
    }
  }
}
