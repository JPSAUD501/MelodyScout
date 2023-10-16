import { type MsGeniusApiGetSongData } from '../../api/msGeniusApi/base'
import { sanitizeText } from '../../functions/sanitizeText'

export function getLyricsText (ctxLang: string | undefined, track: string, artist: string, geniusSong: MsGeniusApiGetSongData, requestedBy: string, translatedLyrics?: string): string {
  const lyrics = translatedLyrics ?? geniusSong.lyrics
  const textArray: string[] = []

  const defaultMessageLength = 450
  const maxLyricsLength = 4096 - defaultMessageLength

  textArray.push(`<b>[📝] Letra de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida pela <a href="${geniusSong.song.url}">Genius</a>${translatedLyrics !== undefined ? ' traduzida para o português' : ''} solicitada por ${requestedBy}</b>`)
  textArray.push('')
  textArray.push(sanitizeText(lyrics.length > maxLyricsLength ? lyrics.slice(0, maxLyricsLength) + '...' : lyrics))
  if (lyrics.length > maxLyricsLength) {
    textArray.push('')
    textArray.push(`<a href="${geniusSong.song.url}">(Para ver a letra completa, clique aqui)</a>`)
  }

  const text = textArray.join('\n')
  return text
}
