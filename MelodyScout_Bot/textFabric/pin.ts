import { lang2 } from '../../translations/base'

export function getPinText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang2(ctxLang, { key: 'whatAreYouListeningNowPinMessage', value: 'O que vc está ouvindo agr?' }))
  const text = textArray.join('\n')
  return text
}
