import { lang } from '../../translations/base'

export function getPinText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, { key: 'whatAreYouListeningNowPinMessage', value: 'O que vc está ouvindo?' }))
  const text = textArray.join('\n')
  return text
}
