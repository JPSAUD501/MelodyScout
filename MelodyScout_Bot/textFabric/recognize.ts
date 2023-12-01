import { type AcrCloudTrack } from '../../api/msAcrCloudApi/types/zodIdentifyTrack'

export function getRecognizeText (ctxLang: string | undefined, recognizeType: 'music' | 'humming', recognizeTrack: AcrCloudTrack, previewUrl: string | undefined, requesterId: string, requesterName: string): string {
  const textArray: string[] = []
  switch (true) {
    default: {
      if (previewUrl !== undefined) {
        textArray.push(`<a href="${previewUrl}">️️</a><b>[🎵] Pré-visualização de "${recognizeTrack.title}" por "${recognizeTrack.artists[0].name}"</b>`)
        break
      }
      textArray.push(`<b>[🎵] "${recognizeTrack.title}" por "${recognizeTrack.artists[0].name}"</b>`)
    }
  }
  textArray.push('')
  switch (true) {
    default: {
      if (recognizeType === 'music') {
        textArray.push(`- Música identificada com ${recognizeTrack.score}% de certeza!`)
        break
      }
      if (recognizeType === 'humming') {
        textArray.push(`- Música cantarolada identificada com ${recognizeTrack.score}% de certeza!`)
        break
      }
    }
  }
  if (recognizeTrack.db_begin_time_offset_ms !== undefined) {
    const minutes = Math.floor(recognizeTrack.db_begin_time_offset_ms / 1000 / 60)
    const seconds = Math.round(recognizeTrack.db_begin_time_offset_ms / 1000 - minutes * 60)
    textArray.push(`- O trecho enviado parece começar por volta dos ${minutes} minutos e ${seconds} segundos da música original.`)
  }
  textArray.push('')
  textArray.push(`Solicitado por: <b><a href='tg://user?id=${requesterId}'>${requesterName}</a></b>`)
  if (previewUrl !== undefined) textArray.push('️️')
  const text = textArray.join('\n')
  return text
}
