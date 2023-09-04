import { lang } from '../../translations/base'

export function getForgetmeText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  // textArray.push('Pronto! Eu esqueci o seu nome de usuário do Last.fm!')
  textArray.push(lang(ctxLang, 'tfForgetmeSuccessMessage'))
  const text = textArray.join('\n')
  return text
}
