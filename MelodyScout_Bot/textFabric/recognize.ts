import { type AcrCloudTrack } from '../../api/msAcrCloudApi/types/zodIdentifyTrack'
import { lang } from '../../translations/base'

export function getRecognizeText (ctxLang: string | undefined, recognizeType: 'music' | 'humming', recognizeTrack: AcrCloudTrack, previewUrl: string | undefined, requesterId: string, requesterName: string): string {
  const textArray: string[] = []
  switch (true) {
    default: {
      const linkHeader = `<a href="${previewUrl}">️️</a>`
      if (previewUrl !== undefined) {
        // textArray.push(`<b>[🎵] Pré-visualização de "${recognizeTrack.title}" por "${recognizeTrack.artists[0].name}"</b>`)
        // textArray.push()
        textArray.push(`${linkHeader}${lang(ctxLang, { key: 'tfRecognizePreviewHeader', value: '<b>[🎵] Pré-visualização de "{{recognizeTrackTitle}}" por "{{recognizeTrackArtistName}}"</b>' }, { previewUrl, recognizeTrackTitle: recognizeTrack.title, recognizeTrackArtistName: recognizeTrack.artists[0].name })}`)
        break
      }
      // textArray.push(`<b>[🎵] "${recognizeTrack.title}" por "${recognizeTrack.artists[0].name}"</b>`)
      textArray.push(lang(ctxLang, { key: 'tfRecognizeTrackInfo', value: '<b>[🎵] "{{recognizeTrackTitle}}" por "{{recognizeTrackArtistName}}"</b>' }, { recognizeTrackTitle: recognizeTrack.title, recognizeTrackArtistName: recognizeTrack.artists[0].name }))
    }
  }
  textArray.push('')
  switch (true) {
    default: {
      if (recognizeType === 'music') {
        // textArray.push(`- Música identificada com ${recognizeTrack.score}% de certeza!`)
        textArray.push(lang(ctxLang, { key: 'tfRecognizeTrackScoreByTrackSample', value: '- Música identificada com {{recognizeTrackScore}}% de certeza!' }, { recognizeTrackScore: recognizeTrack.score }))
        break
      }
      if (recognizeType === 'humming') {
        // textArray.push(`- Música cantarolada identificada com ${(recognizeTrack.score * 100).toFixed(0)}% de certeza!`)
        textArray.push(lang(ctxLang, { key: 'tfRecognizeTrackScoreByHummingSample', value: '- Música cantarolada identificada com {{recognizeTrackScore}}% de certeza!' }, { recognizeTrackScore: (recognizeTrack.score * 100).toFixed(0) }))
        break
      }
    }
  }
  if (recognizeTrack.db_begin_time_offset_ms !== undefined) {
    const minutes = Math.floor(recognizeTrack.db_begin_time_offset_ms / 1000 / 60)
    const seconds = Math.round(recognizeTrack.db_begin_time_offset_ms / 1000 - minutes * 60)
    // textArray.push(`- O trecho enviado parece começar por volta de ${minutes} minutos e ${seconds} segundos da música original.`)
    textArray.push(lang(ctxLang, { key: 'tfRecognizeTrackOffset', value: '- O trecho enviado parece começar por volta de {{minutes}} minutos e {{seconds}} segundos da música original.' }, { minutes, seconds }))
  }
  textArray.push('')
  // textArray.push(`Solicitado por: <b><a href='tg://user?id=${requesterId}'>${requesterName}</a></b>`)
  textArray.push(lang(ctxLang, { key: 'tfRecognizeRequestedBy', value: 'Solicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' }, { requesterId, requesterName }))
  if (previewUrl !== undefined) textArray.push('️️')
  const text = textArray.join('\n')
  return text
}
