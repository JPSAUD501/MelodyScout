import { lang } from '../../translations/base'

export function getHelpText (ctxLang: string | undefined): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, { key: 'tfHelpInform', value: 'Bem vindo ao MelodyScout! Todos os meus comandos aparecerão ao digitar "/" no chat. Para começar use por exemplo o comando /playingnow para ver o que está ouvindo agora! Se quiser depois gerar uma imagem que represente a música usando o MelodyScoutAI utilize o botão com o emoji "✨" que irá aparecer!' }))
  const text = textArray.join('\n')
  return text
}
