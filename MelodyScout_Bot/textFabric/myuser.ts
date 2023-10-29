import { lang } from '../../translations/base'

export function getMyuserText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, { key: 'myuserLastfmUserSuccessfullyRegisteredInformMessage', value: 'Pronto! Seu nome de usuário do Last.fm foi registrado com sucesso! Agradeço imensamente por isso e espero que você aproveite o bot!' }))
  const text = textArray.join('\n')
  return text
}
