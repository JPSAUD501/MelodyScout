import { lang } from '../../translations/base'

export function getStartText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  // textArray.push('Oie! Eu sou o MelodyScout! Sou um bot feito para ser seu companheiro musical aqui no Telegram!')
  // textArray.push('')
  // textArray.push('Estou muito feliz em te conhecer!')
  // textArray.push('')
  // textArray.push('Utilize o comando <code>/myuser</code> para definir seu nome de usuário do Last.fm!')
  // textArray.push('')
  // textArray.push('Em seguida, utilize o comando <code>/help</code> para descobrir tudo que eu posso fazer! 😏')
  textArray.push(lang(ctxLang, { key: 'tfStartMessage', value: 'Oie! Eu sou o MelodyScout! Sou um bot feito para ser seu companheiro musical aqui no Telegram!\n\nEstou muito feliz em te conhecer!\n\nUtilize o comando <code>/myuser</code> para definir seu nome de usuário do Last.fm!\n\nEm seguida, utilize o comando <code>/help</code> para descobrir tudo que eu posso fazer! 😏' }))
  const text = textArray.join('\n')
  return text
}
