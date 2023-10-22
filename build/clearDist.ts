import * as fs from 'fs'
import * as path from 'path'

function clearDist (): void {
  const distPath = path.join(__dirname, 'dist')
  if (fs.existsSync(distPath)) {
    fs.rmdirSync(distPath, { recursive: true })
    console.log('Dist folder removed successfully')
  } else {
    console.log('Dist folder does not exist')
  }
}

clearDist()
