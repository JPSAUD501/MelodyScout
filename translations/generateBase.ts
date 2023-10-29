import fs from 'fs'
import z from 'zod'
import path from 'path'

const baseJsonDir = path.join('translations', 'base')
const baseDir = path.join('translations', 'languages', 'auto')
const baseJsonFileName = 'MS-ptBR.json'
const baseFileName = 'Base-MS-ptBR.ts'
const baseInterfaceFileName = 'Type-MS-ptBR.ts'

export function generateBaseInterface (base: Record<string, string>): {
  success: true
} {
  const json = base
  const textArray: string[] = []
  textArray.push('export type BaseLang =')
  for (const key in json) {
    let value: string = json[key]
    value = value.replaceAll('\n', '\\n')
    switch (true) {
      case (value.includes("'") && value.includes('"')):
        value = `'${value.replaceAll("'", "\\'")}'`
        break
      case (value.includes("'")):
        value = `"${value}"`
        break
      case (value.includes('"')):
        value = `'${value}'`
        break
      default:
        value = `'${value}'`
    }
    let finalString = `  { key: '${key}', value: ${value} }`
    if (Object.keys(json).indexOf(key) < Object.keys(json).length - 1) {
      finalString += ' |'
    }
    textArray.push(`${finalString}`)
  }
  textArray.push('')
  const text = textArray.join('\n')
  if (!fs.existsSync(path.join(baseDir))) {
    fs.mkdirSync(path.join(baseDir))
  }
  const baseInterfaceFileDir = path.join(baseDir, baseInterfaceFileName)
  if (fs.existsSync(baseInterfaceFileDir)) {
    const content = fs.readFileSync(baseInterfaceFileDir).toString()
    if (content === text) {
      console.log(`File ${baseInterfaceFileDir} is already up to date!`)
      return {
        success: true
      }
    }
  }
  fs.writeFileSync(baseInterfaceFileDir, text)
  console.log(`File ${baseInterfaceFileDir} was updated!`)
  return {
    success: true
  }
}

export function generateBaseFile (base: Record<string, string>): {
  success: true
} {
  const json = base
  const textArray: string[] = []
  textArray.push('export const baseLang = {')
  for (const key in json) {
    let value: string = json[key]
    value = value.replaceAll('\n', '\\n')
    switch (true) {
      case (value.includes("'") && value.includes('"')):
        value = `'${value.replaceAll("'", "\\'")}'`
        break
      case (value.includes("'")):
        value = `"${value}"`
        break
      case (value.includes('"')):
        value = `'${value}'`
        break
      default:
        value = `'${value}'`
    }
    let finalString = `  ${key}: ${value}`
    if (Object.keys(json).indexOf(key) < Object.keys(json).length - 1) {
      finalString += ','
    }
    textArray.push(`${finalString}`)
  }
  textArray.push('}')
  textArray.push('')
  const text = textArray.join('\n')
  if (!fs.existsSync(path.join(baseDir))) {
    fs.mkdirSync(path.join(baseDir))
  }
  const baseFileDir = path.join(baseDir, baseFileName)
  if (fs.existsSync(baseFileDir)) {
    const content = fs.readFileSync(baseFileDir).toString()
    if (content === text) {
      console.log(`File ${baseFileDir} is already up to date!`)
      return {
        success: true
      }
    }
  }
  fs.writeFileSync(baseFileDir, text)
  console.log(`File ${baseFileDir} was updated!`)
  return {
    success: true
  }
}

export function generateBase (): {
  success: true
} | {
  success: false
  error: string
} {
  const baseJsonFileDir = path.join(baseJsonDir, baseJsonFileName)
  if (!fs.existsSync(baseJsonFileDir)) {
    return {
      success: false,
      error: `File ${baseJsonFileDir} does not exist!`
    }
  }
  const baseJsonFile = fs.readFileSync(baseJsonFileDir)
  const baseJson = JSON.parse(baseJsonFile.toString())
  const safeParse = z.record(z.string()).safeParse(baseJson)
  if (!safeParse.success) {
    return {
      success: false,
      error: `Error on parsing base.json: ${safeParse.error.message}`
    }
  }
  generateBaseFile(safeParse.data)
  generateBaseInterface(safeParse.data)
  return {
    success: true
  }
}
