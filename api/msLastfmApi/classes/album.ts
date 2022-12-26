import { AlbumInfo, zodAlbumInfo } from '../types/zodAlbumInfo'
import { msApiFetch } from '../function/msApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'

type GetInfoResponse = {
  success: true
  data: AlbumInfo
} | ApiErrors

export class Album {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getInfo (artist: string, album: string, mbid: string, username: string): Promise<GetInfoResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&mbid=${mbid}&username=${encodeURIComponent(username)}&api_key=${this.apiKey}&format=json`
    const zodObject = zodAlbumInfo
    console.log(`Album getInfo: artist: ${artist}, album: ${album}, mbid: ${mbid}, username: ${username}`)
    console.log(`Album getInfo: url: ${url}`)
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
}
