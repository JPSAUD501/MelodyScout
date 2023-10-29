import * as swc from '@swc/core'
import fs from 'fs'
import { getAllCode } from './getAllCode'
import { z } from 'zod'
import cliProgress from 'cli-progress'

const zodValidLangFunction = z.object({
  expression: z.object({
    callee: z.object({ value: z.literal('lang2') }),
    arguments: z.unknown().array()
  })
})
type ValidLangFunction = z.infer<typeof zodValidLangFunction>

const zodValidLangArgument = z.object({
  expression: z.object({
    type: z.literal('ObjectExpression'),
    properties: z.array(z.union([
      z.object({
        type: z.literal('KeyValueProperty'),
        key: z.object({
          type: z.literal('Identifier'),
          value: z.literal('key')
        }),
        value: z.object({
          type: z.literal('StringLiteral'),
          value: z.string()
        })
      }),
      z.object({
        type: z.literal('KeyValueProperty'),
        key: z.object({
          type: z.literal('Identifier'),
          value: z.literal('value')
        }),
        value: z.object({
          type: z.literal('StringLiteral'),
          value: z.string()
        })
      })
    ]))
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
    if (object instanceof Array) {
      for (const item of object) {
        getObjects(item)
      }
    }
  }
  getObjects(item)
  return objects
}

async function getLangKeys (code: string[]): Promise<Record<string, string>> {
  const modules: swc.ModuleItem[] = []
  for (const file of code) {
    const ast = swc.parseSync(file, {
      syntax: 'typescript'
    })
    modules.push(...ast.body)
  }
  const allObjects: Record<number, object> = {}
  let objectsFounded = 0
  for (const module of modules) {
    const objects = getModuleObjects(module)
    for (const object of objects) {
      allObjects[objectsFounded] = object
      objectsFounded++
    }
  }
  console.log(`Founded ${objectsFounded} objects in ${modules.length} modules`)
  const validObjects: ValidLangFunction[] = []
  const progressBar = new cliProgress.SingleBar({
    align: 'left',
    hideCursor: true,
    barsize: 10,
    etaBuffer: 0,
    fps: 10,
    progressCalculationRelative: true,
    format: '[{bar} {percentage}%] | {value}/{total} | {duration_formatted}'
  }, cliProgress.Presets.shades_grey)
  progressBar.start(Object.keys(allObjects).length, 0)
  let processedObjects = 0
  for (const object of Object.values(allObjects)) {
    const safeObject = zodValidLangFunction.safeParse(object)
    if (safeObject.success) {
      validObjects.push(safeObject.data)
    }
    processedObjects++
    progressBar.update(processedObjects)
  }
  progressBar.stop()
  fs.writeFileSync('validObjects.json', JSON.stringify(validObjects, null, 2))
  console.log(`Founded ${validObjects.length} valid lang calls`)
  const validLangCalls: ValidLangArgument[] = []
  for (const object of validObjects) {
    for (const argument of object.expression.arguments) {
      const safeArgument = zodValidLangArgument.safeParse(argument)
      if (safeArgument.success) {
        validLangCalls.push(safeArgument.data)
      }
    }
  }
  fs.writeFileSync('validLangCalls.json', JSON.stringify(validLangCalls, null, 2))
  const langKeys: Record<string, string> = {}
  for (const langParameters of validLangCalls) {
    if (langParameters.expression.properties.length !== 2) {
      console.log('Invalid lang call - Different number of arguments')
      continue
    }
    const prop1 = langParameters.expression.properties[0]
    const prop2 = langParameters.expression.properties[1]
    if (prop1.key.value !== 'key' || prop2.key.value !== 'value') {
      console.log('Invalid lang call - Different argument names')
      continue
    }
    const key = prop1.value.value
    const value = prop2.value.value
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
void getLangKeys(code.codeFiles)
