import fs from 'fs'
import path from 'path'

function fixDist (): void {
  const distClientDir = path.join(__dirname, 'dist', 'client')
  const distDir = path.join(__dirname, 'dist')
  const distClientDirFiles = fs.readdirSync(distClientDir)
  for (const file of distClientDirFiles) {
    fs.renameSync(path.join(distClientDir, file), path.join(distDir, file))
  }
}

fixDist()
