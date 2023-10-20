import genius from 'genius-lyrics/dist/client'
import { advError, advLog } from '../../functions/advancedConsole'
import lyricsFinder from '@flytri/lyrics-finder'
import { zodLyricsFinderData } from './types/zodLyricsFinderData'

interface MsLyricsApiError {
  success: false
  error: string
}

export interface MsLyricsData {
  lyrics: string
  url: string
  provider: string
}

type MsLyricsApiGetGeniusLyricsResponse = {
  success: true
  data: MsLyricsData
} | MsLyricsApiError

type MsLyricsApiGetGoogleLyricsResponse = {
  success: true
  data: MsLyricsData
} | MsLyricsApiError

type MsLyricsApiGetMusicxmatchLyricsResponse = {
  success: true
  data: MsLyricsData
} | MsLyricsApiError

type MsLyricsApiGetLyricsResponse = {
  success: true
  data: MsLyricsData
} | MsLyricsApiError

export class MsLyricsApi {
  private readonly accessToken: string

  constructor (accessToken: string) {
    this.accessToken = accessToken
  }

  private async getGeniusLyrics (track: string, artist: string): Promise<MsLyricsApiGetGeniusLyricsResponse> {
    const songArray = await new genius.Client(this.accessToken).songs.search(`${track} ${artist}`, { sanitizeQuery: true }).catch((err) => {
      return new Error(err)
    })
    if (songArray instanceof Error) {
      advError(`MsLyricsApi - Error while getting song info from Genius! Track: ${track} Artist: ${artist} - Error: ${songArray.message}`)
      return {
        success: false,
        error: songArray.message
      }
    }
    if (songArray.length <= 0) {
      advError(`MsLyricsApi - No results! Track: ${track} Artist: ${artist}`)
      return {
        success: false,
        error: 'No results'
      }
    }
    const geniusSong = songArray[0]
    const lyrics = await geniusSong.lyrics().catch((err) => {
      return new Error(err)
    })
    if (lyrics instanceof Error) {
      advError(`MsLyricsApi - Error while getting lyrics from Genius! Track: ${track} Artist: ${artist} - Error: ${lyrics.message}`)
      return {
        success: false,
        error: lyrics.message
      }
    }
    return {
      success: true,
      data: {
        lyrics,
        url: geniusSong.url,
        provider: 'Genius'
      }
    }
  }

  private async getGoogleLyrics (track: string, artist: string): Promise<MsLyricsApiGetGoogleLyricsResponse> {
    const lyrics = await lyricsFinder.Google(`${track} ${artist}`).catch((err) => {
      return new Error(err)
    })
    if (lyrics instanceof Error) {
      advError(`MsLyricsApi - Error while getting lyrics from lyrics-finder-google! Track: ${track} Artist: ${artist} - Error: ${lyrics.message}`)
      return {
        success: false,
        error: lyrics.message
      }
    }
    const safeParse = zodLyricsFinderData.safeParse(lyrics)
    if (!safeParse.success) {
      advError(`MsLyricsApi - Error while parsing lyrics from lyrics-finder-google! Track: ${track} Artist: ${artist} - Error: ${safeParse.error.message}`)
      return {
        success: false,
        error: safeParse.error.message
      }
    }
    if (safeParse.data.lyrics.length <= 0) {
      advError(`MsLyricsApi - Error while getting lyrics from lyrics-finder-google! Track: ${track} Artist: ${artist} - Error: Lyrics length is 0`)
      return {
        success: false,
        error: 'No lyrics found'
      }
    }
    return {
      success: true,
      data: {
        lyrics: safeParse.data.lyrics,
        url: `https://www.google.com/search?q=${encodeURIComponent(`Lyrics ${track} ${artist}`)}`,
        provider: 'Google'
      }
    }
  }

  private async getMusicxmatchLyrics (track: string, artist: string): Promise<MsLyricsApiGetMusicxmatchLyricsResponse> {
    const lyrics = await lyricsFinder.Musixmatch(`${track} ${artist}`).catch((err) => {
      return new Error(err)
    })
    if (lyrics instanceof Error) {
      advError(`MsLyricsApi - Error while getting lyrics from lyrics-finder-musixmatch! Track: ${track} Artist: ${artist} - Error: ${lyrics.message}`)
      return {
        success: false,
        error: lyrics.message
      }
    }
    const safeParse = zodLyricsFinderData.safeParse(lyrics)
    if (!safeParse.success) {
      advError(`MsLyricsApi - Error while parsing lyrics from lyrics-finder-musixmatch! Track: ${track} Artist: ${artist} - Error: ${safeParse.error.message}`)
      return {
        success: false,
        error: safeParse.error.message
      }
    }
    if (safeParse.data.lyrics.length <= 0) {
      advError(`MsLyricsApi - Error while getting lyrics from lyrics-finder-musixmatch! Track: ${track} Artist: ${artist} - Error: Lyrics length is 0`)
      return {
        success: false,
        error: 'No lyrics found'
      }
    }
    return {
      success: true,
      data: {
        lyrics: safeParse.data.lyrics,
        url: `https://www.musixmatch.com/pt-br/search/${encodeURIComponent(`Lyrics ${track} ${artist}`)}`,
        provider: 'Musixmatch'
      }
    }
  }

  async getLyrics (track: string, artist: string): Promise<MsLyricsApiGetLyricsResponse> {
    const geniusLyricsPromise = this.getGeniusLyrics(track, artist)
    const googleLyricsPromise = this.getGoogleLyrics(track, artist)
    const musicxmatchLyricsPromise = this.getMusicxmatchLyrics(track, artist)
    const [geniusLyrics, googleLyrics, musicxmatchLyrics] = await Promise.all([geniusLyricsPromise, googleLyricsPromise, musicxmatchLyricsPromise])
    const validLyrics: MsLyricsData[] = []
    if (geniusLyrics.success) {
      validLyrics.push(geniusLyrics.data)
    }
    if (googleLyrics.success) {
      validLyrics.push(googleLyrics.data)
    }
    if (musicxmatchLyrics.success) {
      validLyrics.push(musicxmatchLyrics.data)
    }
    if (validLyrics.length <= 0) {
      advError(`MsLyricsApi - No lyrics found! Track: ${track} Artist: ${artist}`)
      return {
        success: false,
        error: 'No lyrics found'
      }
    }
    advLog(`MsLyricsApi - Founded ${validLyrics.length} lyrics! Track: ${track} Artist: ${artist} - Providers: ${validLyrics.map((lyrics) => lyrics.provider).join(', ')}`)
    return {
      success: true,
      data: validLyrics[0]
    }
  }
}
