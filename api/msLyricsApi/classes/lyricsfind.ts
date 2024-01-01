import { advError } from '../../../functions/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { type LyricsFindGetLyricsData, zodLyricsFindGetLyricsData } from '../types/zodLyricsFindGetLyricsData'
import { type LyricsFindSearchTrackData, zodLyricsFindSearchTrackData } from '../types/zodLyricsFindSearchTrackData'

type LyricsFindSearchTrackResponse = {
  success: true
  data: LyricsFindSearchTrackData
} | ApiErrors

type LyricsFindGetLyricsResponse = {
  success: true
  data: LyricsFindGetLyricsData
} | ApiErrors

export class LyricsFind {
  async search (trackName: string, artistName: string): Promise<LyricsFindSearchTrackResponse> {
    const url = `https://lyrics.lyricfind.com/api/v1/search?reqtype=default&territory=BR&searchtype=track&all=${encodeURIComponent(`${trackName} - ${artistName}`)}&limit=1&output=json`
    const method = 'GET'
    const headers = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    const data = undefined
    const expectedZod = zodLyricsFindSearchTrackData
    console.log('MsLyricsApi - LyricsFind - Search - Searching for track...')
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, expectedZod)
    if (!msApiFetchResponse.success) {
      advError(`MsLyricsApi - LyricsFind - Search - Error while searching for track: ${msApiFetchResponse.errorData.status.msg}`)
      return msApiFetchResponse
    }
    return {
      success: true,
      data: msApiFetchResponse.data
    }
  }

  async getLyrics (trackSlug: string): Promise<LyricsFindGetLyricsResponse> {
    const url = `https://lyrics.lyricfind.com/_next/data/CDBg4ohJo18o4YRPWxhlo/en-US/lyrics/${trackSlug}.json?songId=${trackSlug}`
    const method = 'GET'
    const headers = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    const data = undefined
    const expectedZod = zodLyricsFindGetLyricsData
    console.log('MsLyricsApi - LyricsFind - GetLyrics - Getting lyrics...')
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, expectedZod)
    if (!msApiFetchResponse.success) {
      advError(`MsLyricsApi - LyricsFind - GetLyrics - Error while getting lyrics: ${msApiFetchResponse.errorData.status.msg}`)
      return msApiFetchResponse
    }
    return {
      success: true,
      data: msApiFetchResponse.data
    }
  }
}
