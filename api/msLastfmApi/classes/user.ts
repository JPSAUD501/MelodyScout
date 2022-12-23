import { msApiFetch } from '../functions/msApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'
import { UserInfo, zodUserInfo } from '../types/zodUserInfo'
import { UserRecentTracks, zodUserRecentTracks } from '../types/zodUserRecentTracks'

type GetInfoResponse = {
  success: true
  data: UserInfo
} | ApiErrors

type GetRecentTracksResponse = {
  success: true
  data: UserRecentTracks
} | ApiErrors

export class User {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getInfo (username: string): Promise<GetInfoResponse> {
    console.log(`User getInfo: username: ${username}`)

    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserInfo

    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      return msApiFetchResponse
    }
    const userInfo = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userInfo
    }
  }

  async getRecentTracks (username: string, limit: number): Promise<GetRecentTracksResponse> {
    console.log(`User getRecentTracks: username: ${username}, limit: ${limit}`)

    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&limit=${limit}&extended=1&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserRecentTracks

    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      return msApiFetchResponse
    }
    const userRecentTracks = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userRecentTracks
    }
  }
}
