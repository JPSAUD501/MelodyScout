import { type MsLyricsData } from '../../api/msLyricsApi/base'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'
import { lang } from '../../translations/base'

export function getLyricsText (ctxLang: string | undefined, track: string, artist: string, songLyricsData: MsLyricsData, requestedBy: string, translatedLyrics?: string): string {
  const lyrics = translatedLyrics ?? songLyricsData.lyrics
  const textArray: string[] = []

  const defaultMessageLength = 450
  const maxLyricsLength = 4096 - defaultMessageLength

  // textArray.push(`<b>[📝] Letra de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida por <a href="${urlLimiter(songLyricsData.url)}">${songLyricsData.provider}</a>${translatedLyrics !== undefined ? ' traduzida para o português' : ''} solicitada por ${requestedBy}</b>`)
  switch (translatedLyrics !== undefined) {
    case true:
      // textArray.push(`<b>[📝] Letra de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida por <a href="${urlLimiter(songLyricsData.url)}">${songLyricsData.provider}</a> traduzida para o português solicitada por ${requestedBy}</b>`)
      textArray.push(lang(ctxLang, { key: 'tfLyricsTranslatedHeader', value: '<b>[📝] Letra de "{{track}}" por "{{artist}}" fornecida por <a href="{{lyricsUrl}}">{{lyricsProvider}}</a> traduzida para ({{translatedLanguageCode}}) solicitada por {{requestedBy}}</b>' }, {
        track: sanitizeText(track),
        artist: sanitizeText(artist),
        lyricsUrl: urlLimiter(songLyricsData.url),
        lyricsProvider: songLyricsData.provider,
        translatedLanguageCode: lang(ctxLang, { key: 'localeLangCode', value: 'pt-BR' }),
        requestedBy
      }))
      break
    case false:
      // textArray.push(`<b>[📝] Letra de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida por <a href="${urlLimiter(songLyricsData.url)}">${songLyricsData.provider}</a> solicitada por ${requestedBy}</b>`)
      textArray.push(lang(ctxLang, { key: 'tfLyricsHeader', value: '<b>[📝] Letra de "{{track}}" por "{{artist}}" fornecida por <a href="{{lyricsUrl}}">{{lyricsProvider}}</a> solicitada por {{requestedBy}}</b>' }, {
        track: sanitizeText(track),
        artist: sanitizeText(artist),
        lyricsUrl: urlLimiter(songLyricsData.url),
        lyricsProvider: songLyricsData.provider,
        requestedBy
      }))
      break
  }
  textArray.push('')
  textArray.push(sanitizeText(lyrics.length > maxLyricsLength ? lyrics.slice(0, maxLyricsLength) + '...' : lyrics))
  if (lyrics.length > maxLyricsLength) {
    textArray.push('')
    // textArray.push(`<a href="${urlLimiter(songLyricsData.url)}">(Para ver a letra completa, clique aqui)</a>`)
    textArray.push(lang(ctxLang, { key: 'tfLyricsFull', value: '<a href="{{lyricsUrl}}">(Para ver a letra completa, clique aqui)</a>' }, {
      lyricsUrl: urlLimiter(songLyricsData.url)
    }))
  }

  const text = textArray.join('\n')
  return text
}
