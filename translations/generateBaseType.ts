import fs from 'fs'
import z from 'zod'

export function generateBaseType (): {
  success: true
} | {
  success: false
  error: string
} {
  if (!fs.existsSync('./translations/base/MSL-ptBR.json')) {
    return {
      success: false,
      error: 'File base.json not found!'
    }
  }
  const baseJsonFile = fs.readFileSync('./translations/base/MSL-ptBR.json')
  const baseJson = JSON.parse(baseJsonFile.toString())
  const safeParse = z.record(z.string()).safeParse(baseJson)
  if (!safeParse.success) {
    return {
      success: false,
      error: `Error on parsing base.json: ${safeParse.error.message}`
    }
  }
  const json: Record<string, string> = safeParse.data
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
  if (!fs.existsSync('./translations/auto')) {
    fs.mkdirSync('./translations/auto')
  }
  if (fs.existsSync('./translations/auto/MSL-ptBR.ts')) {
    const content = fs.readFileSync('./translations/auto/MSL-ptBR.ts').toString()
    if (content === text) {
      console.log('File MSL-ptBR.ts is already up to date!')
      return {
        success: true
      }
    }
  }
  fs.writeFileSync('./translations/auto/MSL-ptBR.ts', text)
  console.log('File MSL-ptBR.ts was updated!')
  return {
    success: true
  }
}
