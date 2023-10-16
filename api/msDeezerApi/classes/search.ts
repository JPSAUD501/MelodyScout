import { advError } from '../../../functions/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { type SearchAlbum, zodSearchAlbum } from '../types/zodSearchAlbum'
import { type SearchArtist, zodSearchArtist } from '../types/zodSearchArtist'
import { type SearchTrack, zodSearchTrack } from '../types/zodSearchTrack'

type SearchTrackResponse = {
  success: true
  data: SearchTrack
} | ApiErrors

type SearchArtistResponse = {
  success: true
  data: SearchArtist
} | ApiErrors

type SearchAlbumResponse = {
  success: true
  data: SearchAlbum
} | ApiErrors

export class Search {
  async track (trackName: string, artistName: string, limit: number): Promise<SearchTrackResponse> {
    const queryArray: string[] = []
    switch (true) {
      case (trackName.length > 0 && artistName.length > 0): {
        queryArray.push(`track:"${trackName}"`)
        queryArray.push(`artist:"${artistName}"`)
        break
      }
      default: {
        queryArray.push(`${trackName}`)
        break
      }
    }
    const query = queryArray.join(' ')
    const url = `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=${limit}`
    const zodObject = zodSearchTrack
    console.log(`Search track: query: ${query}`)
    console.log(`Search track: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`(MsDeezerApi) Error while fetching search track! Query: ${query} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const trackSearch = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: trackSearch
    }
  }

  async artist (artistName: string, limit: number): Promise<SearchArtistResponse> {
    const query = artistName
    const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`
    const zodObject = zodSearchArtist
    console.log(`Search artist: query: ${query}`)
    console.log(`Search artist: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`(MsDeezerApi) Error while fetching search artist! Query: ${query} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const artistSearch = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: artistSearch
    }
  }

  async album (albumName: string, limit: number): Promise<SearchAlbumResponse> {
    const query = albumName
    const url = `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=${limit}`
    const zodObject = zodSearchAlbum
    console.log(`Search album: query: ${query}`)
    console.log(`Search album: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`(MsDeezerApi) Error while fetching search album! Query: ${query} - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const albumSearch = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: albumSearch
    }
  }
}
