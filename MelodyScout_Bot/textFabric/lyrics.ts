import { MsGeniusApiGetSongData } from '../../api/msGeniusApi/base'
import { sanitizeText } from '../../function/sanitizeText'

export function getLyricsText (track: string, artist: string, geniusSong: MsGeniusApiGetSongData, requestedBy: string, translatedLyrics?: string): string {
  const lyrics = translatedLyrics === undefined ? geniusSong.lyrics : translatedLyrics
  const textArray: string[] = []

  const defaultMessageLength = 400
  const maxLyricsLength = 4096 - defaultMessageLength

  textArray.push(`<b>[📝] Letra de "${sanitizeText(track)}" por "${sanitizeText(artist)}" fornecida pela <a href="${geniusSong.song.url}">Genius</a>${translatedLyrics !== undefined ? ' traduzida para o português' : ''} solicitada por ${requestedBy}</b>`)
  textArray.push('')
  textArray.push(lyrics.length > maxLyricsLength ? lyrics.slice(0, maxLyricsLength) + '...' : lyrics)
  if (lyrics.length > maxLyricsLength) {
    textArray.push('')
    textArray.push(`<a href="${geniusSong.song.url}">(Para ver a letra completa, clique aqui)</a>`)
  }

  const text = textArray.join('\n')
  return text
}
