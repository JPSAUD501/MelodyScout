export function getMashupText (ctxLang: string | undefined, mashupUrl: string, mashupTitle: string): string {
  const textArray: string[] = []
  textArray.push('Espero que goste! 😊')
  textArray.push('')
  textArray.push(`<b><a href="${mashupUrl}">${mashupTitle} por RaveDJ</a></b>`)
  textArray.push('')
  textArray.push('Você pode também fazer o download do vídeo ou audio do mashup clicando nos botões abaixo!')
  const text = textArray.join('\n')
  return text
}
