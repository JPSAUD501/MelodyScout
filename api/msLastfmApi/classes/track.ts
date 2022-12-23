import { msApiFetch } from '../functions/msApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'
import { TrackInfo, zodTrackInfo } from '../types/zodTrackInfo'

type GetInfoResponse = {
  success: true
  data: TrackInfo
} | ApiErrors

export class Track {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getInfo (artist: string, track: string, mbid: string, username: string): Promise<GetInfoResponse> {
    console.log(`Track getInfo: artist: ${artist}, track: ${track}, mbid: ${mbid}, username: ${username}`)

    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&mbid=${mbid}&artist=${artist}&track=${track}&username=${username}&api_key=${this.apiKey}&format=json`
    const zodObject = zodTrackInfo

    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      return msApiFetchResponse
    }
    const trackInfo = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: trackInfo
    }
  }
}
