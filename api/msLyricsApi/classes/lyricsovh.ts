import { msApiFetch } from '../functions/msApiFetch'
import { zodOvhLyricsData, type OvhLyricsData } from '../types/zodOvhLyricsData'
import { zodOvhSuggestData, type OvhSuggestData } from '../types/zodOvhSuggestData'
import { type ApiErrors } from '../types/errors/ApiErrors'

type OvhSuggestDataResponse = {
  success: true
  data: OvhSuggestData
} | ApiErrors

type OvhLyricsResponse = {
  success: true
  data: OvhLyricsData
} | ApiErrors

export class LyricsOvh {
  private async searchSong (track: string, artist: string): Promise<OvhSuggestDataResponse> {
    const query = `${track} ${artist}`
    const url = `https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`
    const method = 'GET'
    const headers = undefined
    const data = undefined
    console.log('MsLyricsApi - LyricsOvh - SearchSong - Searching for song...')
    const response = await msApiFetch(url, method, headers, data, zodOvhSuggestData)
    if (!response.success) return response
    const suggestData = response.data
    if (!Array.isArray(suggestData.data) || suggestData.data.length === 0) {
      const errorResponse: ApiErrors = {
        success: false,
        errorType: 'msApiError',
        errorData: { status: { msg: 'No suggestion found', code: -5 } }
      }
      return errorResponse
    }
    return {
      success: true,
      data: suggestData.data[0]
    }
  }

  async getLyrics (track: string, artist: string): Promise<OvhLyricsResponse> {
    const searchResult: any = await this.searchSong(track, artist)
    if (searchResult.success !== true) {
      console.error(`MsLyricsApi - LyricsOvh - SearchSong Error: ${searchResult.errorData.status.msg}`)
      return searchResult
    }
    const firstItem = searchResult.data
    const lyricArtist = firstItem.artist.name
    const lyricTitle = firstItem.title
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(lyricArtist)}/${encodeURIComponent(lyricTitle)}`
    const method = 'GET'
    const headers = undefined
    const data = undefined
    console.log('MsLyricsApi - LyricsOvh - GetLyrics - Getting lyrics...')
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, zodOvhLyricsData)
    if (!msApiFetchResponse.success) {
      console.error(`MsLyricsApi - LyricsOvh - Error: ${msApiFetchResponse.errorData.status.msg}`)
      return msApiFetchResponse
    }
    const parsedLyrics = msApiFetchResponse.data.lyrics.replace(/\n\n/g, '\n')
    return {
      success: true,
      data: {
        lyrics: parsedLyrics
      }
    }
  }
}
