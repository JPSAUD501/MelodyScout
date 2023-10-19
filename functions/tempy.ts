import fs from 'fs'
import fsPromises from 'node:fs/promises'
import path from 'path'
import crypto from 'crypto'
import os from 'node:os'
import { pipeline } from 'stream/promises'

export function isStream (stream: any): boolean {
  return stream !== null &&
    typeof stream === 'object' &&
    typeof stream.pipe === 'function'
}

export function isWritableStream (stream: any): boolean {
  return isStream(stream) &&
    stream.writable !== false &&
    typeof stream._write === 'function' &&
    typeof stream._writableState === 'object'
}

export function isReadableStream (stream: any): boolean {
  return isStream(stream) &&
    stream.readable !== false &&
    typeof stream._read === 'function' &&
    typeof stream._readableState === 'object'
}

export function isDuplexStream (stream: any): boolean {
  return isWritableStream(stream) &&
    isReadableStream(stream)
}

export function isTransformStream (stream: any): boolean {
  return isDuplexStream(stream) &&
    typeof stream._transform === 'function'
}

const tempDir = fs.realpathSync(os.tmpdir())

const getPath = (prefix: string = ''): string => path.join(tempDir, prefix + crypto.randomUUID().replace(/-/g, ''))

const writeStream = async (filePath: string, data: any): Promise<void> => { await pipeline(data, fs.createWriteStream(filePath)) }

async function runTask (temporaryPath: string, callback: (temporaryPath: string) => any): Promise<void> {
  try {
    await callback(temporaryPath)
  } finally {
    await fsPromises.rm(temporaryPath, { recursive: true, force: true, maxRetries: 2 })
  }
}

export function temporaryFile ({ name, extension }: { name?: string, extension?: string } = {}): string {
  if (name !== undefined) {
    if (extension !== undefined && extension !== null) {
      throw new Error('The `name` and `extension` options are mutually exclusive')
    }

    return path.join(temporaryDirectory(), name)
  }

  return getPath() + (extension === undefined || extension === null ? '' : '.' + extension.replace(/^\./, ''))
}

export const temporaryFileTask = async (callback: (temporaryPath: string) => any, options?: { name?: string, extension?: string }): Promise<void> => { await runTask(temporaryFile(options), callback) }

export function temporaryDirectory ({ prefix = '' } = {}): string {
  const directory = getPath(prefix)
  fs.mkdirSync(directory)
  return directory
}

export const temporaryDirectoryTask = async (callback: (temporaryPath: string) => any, options?: { prefix?: string }): Promise<void> => { await runTask(temporaryDirectory(options), callback) }

export async function temporaryWrite (fileContent: any, options?: {
  name?: string
  extension?: string
}): Promise<string> {
  const filename = temporaryFile(options)
  const write = isStream(fileContent) ? writeStream : fsPromises.writeFile
  await write(filename, fileContent)
  return filename
}

export const temporaryWriteTask = async (fileContent: any, callback: (temporaryPath: string) => any, options?: {
  name?: string
  extension?: string
}): Promise<void> => { await runTask(await temporaryWrite(fileContent, options), callback) }

export function temporaryWriteSync (fileContent: any, options?: {
  name?: string
  extension?: string
}): string {
  const filename = temporaryFile(options)
  fs.writeFileSync(filename, fileContent)
  return filename
}

export { default as rootTemporaryDirectory } from 'temp-dir'
