export function getStartText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push('Oi, eu sou o MelodyScout, e estou aqui rastrear perfis no Last.fm!')
  textArray.push('Que legal fazer parte desse grupo com vocês! Espero que gostem de mim! Bom, vamos lá!')
  textArray.push('')
  textArray.push('Utilize o comando <code>/myuser</code> para definir seu nome de usuário do Last.fm!')
  textArray.push('Em seguida, utilize o comando <code>/help</code> para descobrir tudo que eu posso fazer!')
  const text = textArray.join('\n')
  return text
}
