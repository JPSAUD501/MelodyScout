import { lang } from '../../translations/base'

export function getPostimageText (ctxLang: string | undefined, postUrl: string, requesterId: string, requesterName: string): string {
  const textArray: string[] = []
  textArray.push(lang(ctxLang, { key: 'tfPostimageBlueskySuccessMessage', value: 'Imagem compartilhada com sucesso na conta do MelodyScout no Bluesky!\n\n<b><a href="{{postUrl}}">Ver publicação</a></b>\n\nSolicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' }, { postUrl, requesterId, requesterName }))
  const text = textArray.join('\n')
  return text
}
