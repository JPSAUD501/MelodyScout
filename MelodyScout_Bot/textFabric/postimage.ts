export function getPostimageText (ctxLang: string | undefined, postUrl: string, requesterId: string, requesterName: string): string {
  const textArray: string[] = []
  textArray.push(`Imagem compartilhada com sucesso nos stories da conta do MelodyScout no Instagram!\n\n<b><a href="${postUrl}">Ver publicação</a></b>\n\nSolicitado por: <b><a href='tg://user?id=${requesterId}'>${requesterName}</a></b>`)
  const text = textArray.join('\n')
  return text
}
