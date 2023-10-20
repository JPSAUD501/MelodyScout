import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export function getTempDir (): string {
  const uuid = crypto.randomUUID().replaceAll('-', '')
  if (!fs.existsSync(path.join(__dirname, '../temp'))) {
    fs.mkdirSync(path.join(__dirname, '../temp'))
  }
  if (!fs.existsSync(path.join(__dirname, '../temp', uuid))) {
    fs.mkdirSync(path.join(__dirname, '../temp', uuid))
  }
  return path.join(__dirname, '../temp', uuid)
}

export function deleteTempDir (tempDir: string): void {
  if (!fs.existsSync(tempDir)) {
    return
  }
  fs.rmSync(tempDir, { recursive: true })
}
