import { type MsLyricsData } from '../../api/msLyricsApi/base'
import { sanitizeText } from '../../functions/sanitizeText'
import { urlLimiter } from '../../functions/urlLimiter'

export function getLyricsText (ctxLang: string | undefined, track: string, artist: string, songLyricsData: MsLyricsData, requestedBy: string, translatedLyrics?: string): string {
  const lyrics = translatedLyrics ?? songLyricsData.lyrics
  const textArray: string[] = []

  const defaultMessageLength = 450
  const maxLyricsLength = 4096 - defaultMessageLength

  textArray.push(`<b>[📝] Letra de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida por <a href="${urlLimiter(songLyricsData.url)}">${songLyricsData.provider}</a>${translatedLyrics !== undefined ? ' traduzida para o português' : ''} solicitada por ${requestedBy}</b>`)
  textArray.push('')
  textArray.push(sanitizeText(lyrics.length > maxLyricsLength ? lyrics.slice(0, maxLyricsLength) + '...' : lyrics))
  if (lyrics.length > maxLyricsLength) {
    textArray.push('')
    textArray.push(`<a href="${urlLimiter(songLyricsData.url)}">(Para ver a letra completa, clique aqui)</a>`)
  }

  const text = textArray.join('\n')
  return text
}
