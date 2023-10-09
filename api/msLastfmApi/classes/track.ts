import { advError } from '../../../functions/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { type TrackInfo, zodTrackInfo } from '../types/zodTrackInfo'
import { type TrackSearch, zodTrackSearch } from '../types/zodTrackSearch'

type GetInfoResponse = {
  success: true
  data: TrackInfo
} | ApiErrors

type TrackSearchResponse = {
  success: true
  data: TrackSearch
} | ApiErrors

export class Track {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getInfo (artist: string, track: string, mbid: string, username: string): Promise<GetInfoResponse> {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&mbid=&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&username=${encodeURIComponent(username)}&api_key=${this.apiKey}&format=json`
    const zodObject = zodTrackInfo
    console.log(`Track getInfo: artist: ${artist}, track: ${track}, mbid: ${mbid}, username: ${username}`)
    console.log(`Track getInfo: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching track info! Artist: ${artist}, Track: ${track}, mbid: ${mbid}, username: ${username} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const trackInfo = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: trackInfo
    }
  }

  async search (track: string, artist: string, limit: number): Promise<TrackSearchResponse> {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(track)}&artist=${encodeURIComponent(artist)}&limit=${limit}&api_key=&api_key=${this.apiKey}&format=json`
    const zodObject = zodTrackSearch
    console.log(`Track search: track: ${track}, artist: ${artist}, limit: ${limit}`)
    console.log(`Track search: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching track search! Track: ${track}, Artist: ${artist}, Limit: ${limit} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const trackSearch = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: trackSearch
    }
  }
}
