import { lang } from '../../translations/base'

export function getMashupText (ctxLang: string | undefined, mashupUrl: string, mashupTitle: string): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, { key: 'tfMashupMessage', value: 'Mashup criado! Espero que goste!\n\n<b><a href="{{mashupUrl}}">{{mashupTitle}} por RaveDJ</a></b>\n\nVocê pode também fazer o download do vídeo ou audio do mashup clicando nos botões abaixo!' }, { mashupUrl, mashupTitle }))
  const text = textArray.join('\n')
  return text
}
