import { lang } from '../../translations/base'

export function getPinText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, 'whatAreYouListeningNowPinMessage'))
  const text = textArray.join('\n')
  return text
}
