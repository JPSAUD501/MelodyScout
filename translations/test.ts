import * as esprima from 'esprima'
import * as esbuild from 'esbuild'
// import { getAllCode } from './getAllCode'
import fs from 'fs'

function gerarJson (code: string): any {
  const ast = esprima.parseModule(code)
  const calls: Array<{
    arguments: any
  }> = []
  for (const node of ast.body) {
    if (node.type !== 'ExpressionStatement') continue
    if (node.expression.type !== 'CallExpression') continue
    if (node.expression.callee.type !== 'Identifier') continue
    if (node.expression.callee.name !== 'lang') continue
    calls.push({
      arguments: node.expression.arguments
    })
  }

  fs.writeFileSync('translations.json', JSON.stringify(calls, null, 2))
}

// const code = getAllCode()
const code1 = esbuild.buildSync({
  entryPoints: ['./app.ts'],
  bundle: true,
  platform: 'node',
  target: ['node18'],
  keepNames: true,
  tsconfig: 'tsconfig.json',
  packages: 'external',
  write: false,
  format: 'cjs'
}).outputFiles
const code2 = code1?.shift()?.text ?? ''
fs.writeFileSync('app.js', code2)
gerarJson(code2)
