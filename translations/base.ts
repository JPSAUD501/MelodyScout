import { type BaseLangInterface } from './auto/I-MSL-ptBR'
import { baseLang } from './auto/MSL-ptBR'
import { en } from './languages/en'

export type Language = typeof baseLang
export type Parameters = keyof typeof baseLang

export function lang (langCode: string | undefined, getParameter: Parameters, values?: Record<string, string | number>): string {
  const lang: Language = langCode === 'en' ? { ...baseLang, ...en } : baseLang
  if (values !== undefined) return keyReplace(lang[getParameter], values)
  return lang[getParameter]
}

export function lang2 (langCode: string | undefined, { key, value }: BaseLangInterface, variables?: Record<string, string | number>): string {
  const lang: Language = langCode === 'en' ? { ...baseLang, ...en } : baseLang
  const keyValue: string | undefined = lang[key]
  if (keyValue === undefined) return value
  if (variables === undefined) return keyValue
  return keyReplace(keyValue, variables)
}

function keyReplace (text: string, values: Record<string, string | number>): string {
  let newText = text
  for (const key in values) {
    newText = newText.replace(`{{${key}}}`, String(values[key]))
  }
  return newText
}
