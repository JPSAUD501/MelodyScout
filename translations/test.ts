import * as swc from '@swc/core'
import fs from 'fs'
import { getAllCode } from './getAllCode'
import { z } from 'zod'

const zodValidLangFunction = z.object({
  expression: z.object({
    callee: z.object({ value: z.literal('lang2') }),
    arguments: z.unknown().array()
  })
})
type ValidLangFunction = z.infer<typeof zodValidLangFunction>

const zodValidLangArgument = z.object({
  expression: z.object({
    type: z.literal('StringLiteral'),
    value: z.string(),
    raw: z.string()
  })
})
type ValidLangArgument = z.infer<typeof zodValidLangArgument>

function getModuleObjects (item: object): object[] {
  const objects: object[] = []
  function getObjects (object: object): void {
    if (object instanceof Object) {
      objects.push(object)
      for (const key in object) {
        getObjects(object[key])
      }
    }
  }
  getObjects(item)
  return objects
}

function getLangKeys (code: string[]): Record<string, string> {
  const modules: swc.ModuleItem[] = []
  for (const file of code) {
    const ast = swc.parseSync(file, {
      syntax: 'typescript'
    })
    modules.push(...ast.body)
  }
  const objects: object[] = []
  for (const module of modules) {
    objects.push(...getModuleObjects(module))
  }
  console.log(objects.length)
  const validObjects: ValidLangFunction[] = []
  for (const object of objects) {
    const safeObject = zodValidLangFunction.safeParse(object)
    if (safeObject.success) {
      validObjects.push(safeObject.data)
    }
  }
  console.log(validObjects.length)
  const validLangCalls: ValidLangArgument[][] = []
  for (const object of validObjects) {
    const literalArguments: ValidLangArgument[] = []
    for (const argument of object.expression.arguments) {
      const safeArgument = zodValidLangArgument.safeParse(argument)
      if (safeArgument.success) {
        literalArguments.push(safeArgument.data)
      }
    }
    validLangCalls.push(literalArguments)
  }
  fs.writeFileSync('validLangCalls.json', JSON.stringify(validLangCalls, null, 2))
  const langKeys: Record<string, string> = {}
  for (const langParameters of validLangCalls) {
    if (langParameters.length < 2) {
      console.log(`Invalid lang call - Missing parameters: ${JSON.stringify(langParameters, null, 2)}`)
      continue
    }
    const key = langParameters[0].expression.value
    const value = langParameters[1].expression.value
    if (langKeys[key] !== undefined) {
      if (langKeys[key] !== value) {
        console.log(`Invalid lang call - Different values for key ${key}: ${langKeys[key]} and ${value}`)
        continue
      }
    }
    langKeys[key] = value
  }
  fs.writeFileSync('langKeys.json', JSON.stringify(langKeys, null, 2))
  return langKeys
}

const code = getAllCode()
getLangKeys(code.codeFiles)
