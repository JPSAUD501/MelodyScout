import fs from 'fs'
import path from 'path'

export function getAllCode (): string {
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
  return allCode
}
