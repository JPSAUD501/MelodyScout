import * as swc from '@swc/core'
import { z } from 'zod'
import cliProgress from 'cli-progress'

const zodValidLangFunction = z.object({
  type: z.literal('CallExpression'),
  callee: z.object({
    type: z.literal('Identifier'),
    value: z.literal('lang')
  }),
  arguments: z.unknown().array()
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
  function getObjects (object: any): void {
    if (object instanceof Object || typeof object === 'object') {
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

export async function getAllLangKeys (code: string[]): Promise<Record<string, string>> {
  const modules: swc.ModuleItem[] = []
  for (const file of code) {
    const ast = swc.parseSync(file, {
      syntax: 'typescript'
    })
    if (!JSON.stringify(ast).includes('lang')) continue
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
  console.log(`In ${code.length} files and ${modules.length} valid modules, founded ${objectsFounded} possible objects`)
  const validObjects: ValidLangFunction[] = []
  const progressBar = new cliProgress.SingleBar({
    align: 'left',
    hideCursor: true,
    barsize: 10,
    etaBuffer: 0,
    fps: 10,
    progressCalculationRelative: true,
    linewrap: true,
    format: '[{bar} {percentage}%] | {value}/{total} | {duration_formatted}'
  }, cliProgress.Presets.shades_grey)
  progressBar.start(Object.keys(allObjects).length, 0)
  let processedObjects = 0
  for (const object of Object.values(allObjects)) {
    if (JSON.stringify(object).includes('lang')) {
      const safeObject = zodValidLangFunction.safeParse(object)
      if (safeObject.success) {
        validObjects.push(safeObject.data)
      }
    }
    processedObjects++
    progressBar.update(processedObjects)
  }
  progressBar.stop()
  console.log(`Founded ${validObjects.length} valid lang calls`)
  const validLangCalls: ValidLangArgument[] = []
  for (const object of validObjects) {
    for (const argument of object.arguments) {
      const safeArgument = zodValidLangArgument.safeParse(argument)
      if (safeArgument.success) {
        validLangCalls.push(safeArgument.data)
      }
    }
  }
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
        throw new Error(`Invalid lang call - Different values for key ${key}: ${langKeys[key]} and ${value}`)
      }
    }
    langKeys[key] = value
  }
  return langKeys
}
