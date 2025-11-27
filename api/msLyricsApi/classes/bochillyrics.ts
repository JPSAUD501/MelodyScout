import { advError } from '../../../functions/advancedConsole'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { zodBochilLyricsData, type BochilLyricsData } from '../types/zodBochilLyricsData'
import { lyrics, lyricsv2 } from '@bochilteam/scraper-lyrics'

type BochilLyricsResponse = {
  success: true
  data: BochilLyricsData
} | ApiErrors

export class BochilLyrics {
  async getLyrics (trackName: string, artistName: string): Promise<BochilLyricsResponse> {
    const query = `${trackName} ${artistName}`
    console.log('MsLyricsApi - BochilLyrics - GetLyrics - Searching for lyrics...')

    // Try lyricsv2 first (Genius)
    try {
      const lyricsv2Result = await lyricsv2(query)
      const parsedV2 = zodBochilLyricsData.safeParse(lyricsv2Result)
      if (parsedV2.success && parsedV2.data.lyrics.length > 0) {
        return {
          success: true,
          data: parsedV2.data
        }
      }
    } catch (err) {
      advError(`MsLyricsApi - BochilLyrics - lyricsv2 failed: ${String(err)}`)
    }

    // Fallback to lyrics (Musixmatch)
    try {
      const lyricsResult = await lyrics(query)
      const parsed = zodBochilLyricsData.safeParse(lyricsResult)
      if (parsed.success && parsed.data.lyrics.length > 0) {
        return {
          success: true,
          data: parsed.data
        }
      }
      advError('MsLyricsApi - BochilLyrics - lyrics parsing failed or no lyrics found')
    } catch (err) {
      advError(`MsLyricsApi - BochilLyrics - lyrics failed: ${String(err)}`)
    }

    return {
      success: false,
      errorType: 'msApiError',
      errorData: {
        status: {
          msg: 'No lyrics found from BochilLyrics',
          code: -5
        }
      }
    }
  }

  formatLyricsToString (lyricsData: BochilLyricsData): string {
    return lyricsData.lyrics
      .filter(item => item.type === 'lyric')
      .map(item => item.text)
      .join('\n')
  }
}
