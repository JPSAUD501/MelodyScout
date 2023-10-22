import fs from 'fs'
import path from 'path'

async function fixDistFolder (): Promise<void> {
  // Move all files inside ../dist/client to ../dist
  const distClientDir = path.join(__dirname, '..', 'dist', 'client')
  const distDir = path.join(__dirname, '..', 'dist')
  const distClientDirFiles = fs.readdirSync(distClientDir)
  for (const file of distClientDirFiles) {
    fs.renameSync(path.join(distClientDir, file), path.join(distDir, file))
  }
}

void fixDistFolder()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
