import { lang } from '../../translations/base'

export function getMashupText (ctxLang: string | undefined, mashupUrl: string, mashupTitle: string): string {
  const textArray: string[] = []
  // textArray.push('Mashup criado! Espero que goste!')
  textArray.push(lang(ctxLang, { key: 'tfMashupHeader', value: 'Mashup criado! Espero que goste!' }))
  textArray.push('')
  // textArray.push(`<b><a href="${mashupUrl}">${mashupTitle} por RaveDJ</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfMashupLink', value: '<b><a href="{{mashupUrl}}">{{mashupTitle}} por RaveDJ</a></b>' }, { mashupUrl, mashupTitle }))
  textArray.push('')
  // textArray.push('Você pode também fazer o download do vídeo ou audio do mashup clicando nos botões abaixo!')
  textArray.push(lang(ctxLang, { key: 'tfMashupDownloadInform', value: 'Você pode também fazer o download do vídeo ou audio do mashup clicando nos botões abaixo!' }))
  const text = textArray.join('\n')
  return text
}
