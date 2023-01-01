import { Client } from 'genius-lyrics/dist/client'
import { Song } from 'genius-lyrics/dist/songs/song'

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
  private readonly accessToken: string

  constructor (accessToken: string) {
    this.accessToken = accessToken
  }

  async getSong (track: string, artist: string): Promise<MsGeniusApiGetSongResponse> {
    const songArray = await new Client(this.accessToken).songs.search(`${track} ${artist}`, { sanitizeQuery: true }).catch((err) => {
      console.error(`MsGeniusApi - Error: ${String(err)}`)
      return new Error(err)
    })
    if (songArray instanceof Error) {
      console.error(`MsGeniusApi - Error: ${String(songArray)}`)
      return {
        success: false,
        error: String(songArray)
      }
    }
    if (songArray.length <= 0) {
      console.error('MsGeniusApi - Error: No results')
      return {
        success: false,
        error: 'No results'
      }
    }
    const geniusSong = songArray[0]
    const lyrics = await geniusSong.lyrics().catch((err) => {
      console.error(`MsGeniusApi - Error: ${String(err)}`)
      return new Error(err)
    })
    if (lyrics instanceof Error) {
      console.error(`MsGeniusApi - Error: ${String(lyrics)}`)
      return {
        success: false,
        error: String(lyrics)
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
