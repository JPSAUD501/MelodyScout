import { Client } from 'genius-lyrics/dist/client'
import { Song } from 'genius-lyrics/dist/songs/song'
import { AdvConsole } from '../../function/advancedConsole'

interface MsGeniusApiError {
  success: false
  error: string
}

export interface MsGeniusApiGetSongData {
  song: Song
  lyrics: string
}

type MsGeniusApiGetSongResponse = {
  success: true
  data: MsGeniusApiGetSongData
} | MsGeniusApiError

export class MsGeniusApi {
  private readonly advConsole: AdvConsole
  private readonly accessToken: string

  constructor (advConsole: AdvConsole, accessToken: string) {
    this.advConsole = advConsole
    this.accessToken = accessToken
  }

  async getSong (track: string, artist: string): Promise<MsGeniusApiGetSongResponse> {
    const songArray = await new Client(this.accessToken).songs.search(`${track} ${artist}`, { sanitizeQuery: true }).catch((err) => {
      return new Error(err)
    })
    if (songArray instanceof Error) {
      this.advConsole.error(`MsGeniusApi - Error while getting song info from Genius! Track: ${track} Artist: ${artist} - Error: ${songArray.message}`)
      return {
        success: false,
        error: songArray.message
      }
    }
    if (songArray.length <= 0) {
      this.advConsole.error(`MsGeniusApi - No results! Track: ${track} Artist: ${artist}`)
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
      this.advConsole.error(`MsGeniusApi - Error while getting lyrics from Genius! Track: ${track} Artist: ${artist} - Error: ${lyrics.message}`)
      return {
        success: false,
        error: lyrics.message
      }
    }
    return {
      success: true,
      data: {
        song: geniusSong,
        lyrics
      }
    }
  }
}
