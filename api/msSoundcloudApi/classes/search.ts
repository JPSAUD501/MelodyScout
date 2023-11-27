import { advError } from '../../../functions/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { type SearchTrack, zodSearchTrack } from '../types/zodSearchTrack'

type SearchTrackResponse = {
  success: true
  data: SearchTrack
} | ApiErrors

export class Search {
  async track (trackName: string, artistName: string, limit: number): Promise<SearchTrackResponse> {
    const queryArray: string[] = []
    switch (true) {
      case (trackName.length > 0 && artistName.length > 0): {
        queryArray.push(`${artistName}`)
        queryArray.push(`${trackName}`)
        break
      }
      default: {
        queryArray.push(`${trackName}`)
        break
      }
    }
    const query = queryArray.join(' ')
    const url = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(query)}&client_id=1ZRkRXa5klyxfeCePlMbkWl1xNzz1Bu3&limit=${limit}`
    const zodObject = zodSearchTrack
    console.log(`Search track: query: ${query}`)
    console.log(`Search track: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`(MsSoundcloudApi) Error while fetching search track! Query: ${query} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const trackSearch = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: trackSearch
    }
  }
}
