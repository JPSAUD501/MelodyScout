import { Client } from 'genius-lyrics/dist/client'
import { advError, advLog } from '../../functions/advancedConsole'
import { Google, Musixmatch } from '@flytri/lyrics-finder'
import { zodGoogleLyricsData } from './types/zodGoogleLyricsData'
import { zodMusicxmatchLyricsData } from './types/zodMusicxmatchLyricsData'
import { LyricsFind } from './classes/lyricsfind'

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

type MsLyricsApiGetLyricsFindLyricsResponse = {
  success: true
  data: MsLyricsData
} | MsLyricsApiError

type MsLyricsApiGetLyricsResponse = {
  success: true
  data: MsLyricsData
} | MsLyricsApiError

export class MsLyricsApi {
  private readonly accessToken: string

  public lyricfind: LyricsFind

  constructor (accessToken: string) {
    this.accessToken = accessToken

    this.lyricfind = new LyricsFind()
  }

  private async getGeniusLyrics (track: string, artist: string): Promise<MsLyricsApiGetGeniusLyricsResponse> {
    const songArray = await new Client(this.accessToken).songs.search(`${track} ${artist}`, { sanitizeQuery: true }).catch((err) => {
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
    const lyrics = await Google(`${track} ${artist}`).catch((err) => {
      return new Error(err)
    })
    if (lyrics instanceof Error) {
      advError(`MsLyricsApi - Error while getting lyrics from lyrics-finder-google! Track: ${track} Artist: ${artist} - Error: ${lyrics.message}`)
      return {
        success: false,
        error: lyrics.message
      }
    }
    const safeParse = zodGoogleLyricsData.safeParse(lyrics)
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
        url: `https://google.com/search?q=${encodeURIComponent(`Lyrics ${track} ${artist}`)}`,
        provider: 'Google'
      }
    }
  }

  private async getMusicxmatchLyrics (track: string, artist: string): Promise<MsLyricsApiGetMusicxmatchLyricsResponse> {
    const lyrics = await Musixmatch(`${track} ${artist}`).catch((err) => {
      return new Error(err)
    })
    if (lyrics instanceof Error) {
      advError(`MsLyricsApi - Error while getting lyrics from lyrics-finder-musixmatch! Track: ${track} Artist: ${artist} - Error: ${lyrics.message}`)
      return {
        success: false,
        error: lyrics.message
      }
    }
    const safeParse = zodMusicxmatchLyricsData.safeParse(lyrics)
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
        url: `https://musixmatch.com/search/${encodeURIComponent(`Lyrics ${track} ${artist}`)}`,
        provider: 'Musixmatch'
      }
    }
  }

  private async getLyricsFindLyrics (track: string, artist: string): Promise<MsLyricsApiGetLyricsFindLyricsResponse> {
    const searchResult = await this.lyricfind.search(track, artist)
    if (!searchResult.success) {
      advError(`MsLyricsApi - Error while searching lyrics from lyricsfind! Track: ${track} Artist: ${artist} - Error: ${searchResult.errorData.status.msg}`)
      return {
        success: false,
        error: searchResult.errorData.status.msg
      }
    }
    if (searchResult.data.tracks.length <= 0) {
      advError(`MsLyricsApi - Error while searching lyrics from lyricsfind! Track: ${track} Artist: ${artist} - Error: No tracks found`)
      return {
        success: false,
        error: 'No tracks found'
      }
    }
    const mainTrack = searchResult.data.tracks[0]
    if (mainTrack.score < 5) {
      advError(`MsLyricsApi - Error while searching lyrics from lyricsfind! Track: ${track} Artist: ${artist} - Error: Score is less than 5`)
      return {
        success: false,
        error: 'Score is less than 5'
      }
    }
    const lyricsData = await this.lyricfind.getLyrics(mainTrack.slug)
    if (!lyricsData.success) {
      advError(`MsLyricsApi - Error while getting lyrics from lyricsfind! Track: ${track} Artist: ${artist} - Error: ${lyricsData.errorData.status.msg}`)
      return {
        success: false,
        error: lyricsData.errorData.status.msg
      }
    }
    const lyrics = lyricsData.data.pageProps.songData.track.lyrics
    if (lyrics.length <= 0) {
      advError(`MsLyricsApi - Error while getting lyrics from lyricsfind! Track: ${track} Artist: ${artist} - Error: Lyrics length is 0`)
      return {
        success: false,
        error: 'Lyrics length is 0'
      }
    }
    return {
      success: true,
      data: {
        lyrics,
        url: `https://lyrics.lyricfind.com/lyrics/${mainTrack.slug}`,
        provider: 'LyricsFind'
      }
    }
  }

  async getLyrics (track: string, artist: string): Promise<MsLyricsApiGetLyricsResponse> {
    const geniusLyricsPromise = this.getGeniusLyrics(track, artist)
    const googleLyricsPromise = this.getGoogleLyrics(track, artist)
    const musicxmatchLyricsPromise = this.getMusicxmatchLyrics(track, artist)
    const lyricsFindLyricsPromise = this.getLyricsFindLyrics(track, artist)
    const [geniusLyrics, googleLyrics, musicxmatchLyrics, lyricsFindLyrics] = await Promise.all([geniusLyricsPromise, googleLyricsPromise, musicxmatchLyricsPromise, lyricsFindLyricsPromise])
    const validLyrics: MsLyricsData[] = []
    if (googleLyrics.success) {
      validLyrics.push(googleLyrics.data)
    }
    if (musicxmatchLyrics.success) {
      validLyrics.push(musicxmatchLyrics.data)
    }
    if (lyricsFindLyrics.success) {
      validLyrics.push(lyricsFindLyrics.data)
    }
    if (geniusLyrics.success) {
      validLyrics.push(geniusLyrics.data)
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
