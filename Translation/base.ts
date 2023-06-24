import { advError } from '../function/advancedConsole'
import { enUS } from './languages/enUS'
import { jaJP } from './languages/jaJP'
import { ptBR } from './languages/ptBR'

export type Language = typeof ptBR | typeof enUS | typeof jaJP
export type Parameters = keyof typeof ptBR | keyof typeof enUS | keyof typeof jaJP

export function lang (langCode: string | undefined, getParameter: Parameters, values?: Record<string, string | number>): string {
  const priorityLangs: Language[] = []
  switch (langCode) {
    case 'ja':
      priorityLangs.push(jaJP)
      break
    case 'pt-br':
      priorityLangs.push(ptBR)
      break
    case 'en':
      priorityLangs.push(enUS)
      break
    default:
      priorityLangs.push(ptBR)
      break
  }
  priorityLangs.push(enUS, ptBR, jaJP)
  for (const lang of priorityLangs) {
    if (lang[getParameter] === undefined) continue
    if (values !== undefined) return keyReplace(lang[getParameter], values)
    return lang[getParameter]
  }
  advError(`The parameter ${getParameter} was not found in any language!`)
  return 'ERROR'
}

function keyReplace (text: string, values: Record<string, string | number>): string {
  let newText = text
  for (const key in values) {
    newText = newText.replace(`{{${key}}}`, String(values[key]))
  }
  return newText
}
