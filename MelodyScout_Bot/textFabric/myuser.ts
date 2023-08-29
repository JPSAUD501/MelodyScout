import { lang } from '../../translations/base'

export function getMyuserText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, 'myuserLastfmUserSuccessfullyRegisteredInformMessage'))
  const text = textArray.join('\n')
  return text
}
