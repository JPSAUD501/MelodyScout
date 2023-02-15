import { MsGeniusApiGetSongData } from '../../api/msGeniusApi/base'

export function getLyricsLiteText (track: string, artist: string, geniusSong: MsGeniusApiGetSongData, requestedBy: string, translatedLyrics?: string): string {
  const textArray: string[] = []

  textArray.push(`<b>[📝] Letra de "${track}" por "${artist}" fornecida pela <a href="${geniusSong.song.url}">Genius</a>${translatedLyrics !== undefined ? ' traduzida para o português' : ''} solicitada por ${requestedBy}</b>`)
  textArray.push('')
  textArray.push(`${translatedLyrics === undefined ? geniusSong.lyrics : translatedLyrics}`)

  const text = textArray.join('\n')
  return text
}
