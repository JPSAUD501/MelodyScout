import { advError } from '../../../function/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'
import { UserInfo, zodUserInfo } from '../types/zodUserInfo'
import { UserRecentTracks, zodUserRecentTracks } from '../types/zodUserRecentTracks'
import { UserTopAlbums, zodUserTopAlbums } from '../types/zodUserTopAlbums'
import { UserTopArtists, zodUserTopArtists } from '../types/zodUserTopArtists'
import { UserTopTags, zodUserTopTags } from '../types/zodUserTopTags'
import { UserTopTracks, zodUserTopTracks } from '../types/zodUserTopTracks'

type GetInfoResponse = {
  success: true
  data: UserInfo
} | ApiErrors

type GetRecentTracksResponse = {
  success: true
  data: UserRecentTracks
} | ApiErrors

type GetTopTracksResponse = {
  success: true
  data: UserTopTracks
} | ApiErrors

type GetTopAlbumsResponse = {
  success: true
  data: UserTopAlbums
} | ApiErrors

type GetTopArtistsResponse = {
  success: true
  data: UserTopArtists
} | ApiErrors

type GetTopTagsResponse = {
  success: true
  data: UserTopTags
} | ApiErrors

export class User {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getInfo (username: string): Promise<GetInfoResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(username)}&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserInfo
    console.log(`User getInfo: username: ${username}`)
    console.log(`User getInfo: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching user info! Username: ${username} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userInfo = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userInfo
    }
  }

  async getRecentTracks (username: string, limit: number, page: number): Promise<GetRecentTracksResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&limit=${limit}&extended=1&page=${page}&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserRecentTracks
    console.log(`User getRecentTracks: username: ${username}, limit: ${limit}`)
    console.log(`User getRecentTracks: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching user recent tracks! Username: ${username} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userRecentTracks = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userRecentTracks
    }
  }

  async getTopTracks (username: string, limit: number, page: number): Promise<GetTopTracksResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${encodeURIComponent(username)}&limit=${limit}&page=${page}&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserTopTracks
    console.log(`User getTopTracks: username: ${username}, limit: ${limit}`)
    console.log(`User getTopTracks: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching user top tracks! Username: ${username} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userTopTracks = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userTopTracks
    }
  }

  async getTopAlbums (username: string, limit: number): Promise<GetTopAlbumsResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${encodeURIComponent(username)}&limit=${limit}&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserTopAlbums
    console.log(`User getTopAlbums: username: ${username}, limit: ${limit}`)
    console.log(`User getTopAlbums: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching user top albums! Username: ${username} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userTopAlbums = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userTopAlbums
    }
  }

  async getTopArtists (username: string, limit: number): Promise<GetTopArtistsResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${encodeURIComponent(username)}&limit=${limit}&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserTopArtists
    console.log(`User getTopArtists: username: ${username}, limit: ${limit}`)
    console.log(`User getTopArtists: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching user top artists! Username: ${username} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userTopArtists = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userTopArtists
    }
  }

  async getTopTags (username: string, limit: number): Promise<GetTopTagsResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptags&user=${encodeURIComponent(username)}&limit=${limit}&api_key=${this.apiKey}&format=json`
    const zodObject = zodUserTopTags
    console.log(`User getTopTags: username: ${username}, limit: ${limit}`)
    console.log(`User getTopTags: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching user top tags! Username: ${username} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userTopTags = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userTopTags
    }
  }
}
