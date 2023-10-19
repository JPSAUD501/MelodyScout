import { youtube } from 'scrape-youtube'
import youtubedl from 'youtube-dl-exec'
import fs, { type ReadStream } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { advError } from '../../functions/advancedConsole'
import * as Soundify from '@soundify/web-api'
import { type SearchEndpoint } from '@soundify/web-api/types/api/search/search.endpoints'
import axios from 'axios'

export interface MsMusicApiError {
  success: false
  error: string
}

export interface MsMusicApiSpotifyTrackInfo {
  success: true
  data: Soundify.Track[]
}

export interface MsMusicApiSpotifyAlbumInfo {
  success: true
  data: Soundify.AlbumSimplified[]
}

export interface MsMusicApiSpotifyArtistInfo {
  success: true
  data: Soundify.Artist[]
}

export interface MsMusicApiYoutubeTrackInfo {
  success: true
  // videoWithAudioRawUrl: string
  // audioRawUrl: string
  videoUrl: string
  videoMusicUrl: string
  videoId: string
}

export interface MsMusicApiYoutubeTrackDownload {
  success: true
  file: {
    buffer: Buffer
  }
}

export interface MsMusicApiTrackPreviewDownload {
  success: true
  file: {
    buffer: Buffer
  }
}

export class MsMusicApi {
  private readonly credentialsFlow: Soundify.ClientCredentialsFlow

  constructor (clientID: string, clientSecret: string) {
    this.credentialsFlow = new Soundify.ClientCredentialsFlow({
      client_id: clientID,
      client_secret: clientSecret
    })
  }

  private async getClient (): Promise<{
    success: true
    client: (Soundify.SpotifyClient<string> & SearchEndpoint)
  } | {
    success: false
    error: string
  }> {
    const accessResponse = await this.credentialsFlow.getAccessToken().catch((err) => {
      return new Error(err)
    })
    if (accessResponse instanceof Error) {
      advError(`Error while getting Spotify access token! Error: ${accessResponse.message}`)
      return { success: false, error: accessResponse.message }
    }
    const client = Soundify.createSpotifyAPI(accessResponse.access_token)
    return {
      success: true,
      client
    }
  }

  async getSpotifyTrackInfo (track: string, artist: string): Promise<MsMusicApiError | MsMusicApiSpotifyTrackInfo> {
    const clientResponse = await this.getClient()
    if (!clientResponse.success) return { success: false, error: clientResponse.error }
    const mainSearchPromise = clientResponse.client.search((`${track} ${artist}`).trim(), 'track', { include_external: 'audio', limit: 5 }).catch((err) => {
      return new Error(err)
    })
    const alternativeSearchPromise = clientResponse.client.search((`${track} ${artist}`).trim(), 'track', { include_external: 'audio', limit: 5 }).catch((err) => {
      return new Error(err)
    })
    const [mainSearch, alternativeSearch] = await Promise.all([mainSearchPromise, alternativeSearchPromise])
    const searchResults = [{
      type: 'mainSearch',
      searchResultData: mainSearch
    },
    {
      type: 'alternativeSearch',
      searchResultData: alternativeSearch
    }]
    for (const searchResult of searchResults) {
      if (searchResult.searchResultData instanceof Error) {
        advError(`Error while getting track info from Spotify! Track: ${track} Artist: ${artist ?? ''} - Error: ${searchResult.searchResultData.message} in ${searchResult.type}!`)
        continue
      }
      if (searchResult.searchResultData.tracks.items.length <= 0) {
        advError(` Error while getting track info from Spotify! Track: ${track} Artist: ${artist ?? ''} - Error: No tracks found in ${searchResult.type}!`)
        continue
      }
      return {
        success: true,
        data: searchResult.searchResultData.tracks.items
      }
    }
    advError(`Error while getting track info from Spotify! Track: ${track} Artist: ${artist ?? ''} - Error: No tracks found in both searches!`)
    return { success: false, error: 'No tracks found!' }
  }

  async getSpotifyArtistInfo (artist: string): Promise<MsMusicApiError | MsMusicApiSpotifyArtistInfo> {
    const clientResponse = await this.getClient()
    if (!clientResponse.success) return { success: false, error: clientResponse.error }
    const search = await clientResponse.client.search(artist, 'artist', { include_external: 'audio' }).catch((err) => {
      return new Error(err)
    })
    if (search instanceof Error) {
      advError(`Error while getting artist info from Spotify! Artist: ${artist} - Error: ${search.message}`)
      return { success: false, error: search.message }
    }
    if (search.artists.items.length <= 0) return { success: false, error: 'No artists found!' }
    return {
      success: true,
      data: search.artists.items
    }
  }

  async getSpotifyAlbumInfo (album: string, artist: string): Promise<MsMusicApiError | MsMusicApiSpotifyAlbumInfo> {
    const clientResponse = await this.getClient()
    if (!clientResponse.success) return { success: false, error: clientResponse.error }
    const search = await clientResponse.client.search(`${album} ${artist}`, 'album', { include_external: 'audio' }).catch((err) => {
      return new Error(err)
    })
    if (search instanceof Error) {
      advError(`Error while getting album info from Spotify! Album: ${album} Artist: ${artist} - Error: ${search.message}`)
      return { success: false, error: search.message }
    }
    if (search.albums.items.length <= 0) return { success: false, error: 'No albums found!' }
    return {
      success: true,
      data: search.albums.items
    }
  }

  async getYoutubeTrackInfo (track: string, artist: string): Promise<MsMusicApiError | MsMusicApiYoutubeTrackInfo> {
    const ytSearchResult = await youtube.search(`${track} - ${artist}`)
    if (ytSearchResult.videos.length <= 0) return { success: false, error: 'No videos found!' }
    const video = ytSearchResult.videos[0]
    // const videoWithAudioUrlRequestPromise = youtubedl.exec(video.link, {
    //   format: 'best',
    //   skipDownload: true,
    //   getUrl: true,
    //   noWarnings: true,
    //   callHome: false,
    //   noCheckCertificates: true,
    //   noPart: true,
    //   noPlaylist: true
    // }).catch((err) => {
    //   return new Error(String(err))
    // })
    // const audioUrlRequestPromise = youtubedl.exec(video.link, {
    //   format: 'ba',
    //   skipDownload: true,
    //   getUrl: true,
    //   noWarnings: true,
    //   callHome: false,
    //   noCheckCertificates: true,
    //   noPart: true,
    //   noPlaylist: true
    // }).catch((err) => {
    //   return new Error(String(err))
    // })
    // const [videoWithAudioUrlRequest, audioUrlRequest] = await Promise.all([videoWithAudioUrlRequestPromise, audioUrlRequestPromise])
    // if (videoWithAudioUrlRequest instanceof Error) {
    //   advError(`Error while getting video info from Youtube! Url: ${video.link} - Error: ${videoWithAudioUrlRequest.message}`)
    //   return { success: false, error: videoWithAudioUrlRequest.message }
    // }
    // if (audioUrlRequest instanceof Error) {
    //   advError(`Error while getting video info from Youtube! Url: ${video.link} - Error: ${audioUrlRequest.message}`)
    //   return { success: false, error: audioUrlRequest.message }
    // }
    // if (videoWithAudioUrlRequest.stdout.length <= 0) {
    //   advError(`Error while getting video info from Youtube! Url: ${video.link} - Error: No video with audio found!`)
    //   return { success: false, error: 'No video with audio found!' }
    // }
    // if (audioUrlRequest.stdout.length <= 0) {
    //   advError(`Error while getting video info from Youtube! Url: ${video.link} - Error: No audio found!`)
    //   return { success: false, error: 'No audio found!' }
    // }

    return {
      success: true,
      // videoWithAudioRawUrl: videoWithAudioUrlRequest.stdout,
      // audioRawUrl: audioUrlRequest.stdout,
      videoUrl: video.link,
      videoMusicUrl: `https://music.youtube.com/watch?v=${video.id}`,
      videoId: video.id
    }
  }

  async youtubeTrackVideoDownload (youtubeUrl: string): Promise<MsMusicApiError | MsMusicApiYoutubeTrackDownload> {
    if (!fs.existsSync(path.join(__dirname, './temp'))) {
      fs.mkdirSync(path.join(__dirname, './temp'))
    }
    const id = uuidv4()
    const pathToSave = path.join(__dirname, `./temp/${id}.mp4`)
    if (fs.existsSync(pathToSave)) {
      return {
        success: false,
        error: 'File already exists!'
      }
    }
    const output = await youtubedl.exec(youtubeUrl, {
      format: 'best',
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      noPart: true,
      noPlaylist: true,
      output: pathToSave,
      maxFilesize: '30m'
    }).catch((err) => {
      return new Error(String(err))
    })
    const deleteFile = async (): Promise<void> => {
      try {
        fs.rmSync(pathToSave)
      } catch (err) {
        advError(`Error while deleting file! File: ${id}.* - Error: ${String(err)}`)
      }
    }
    if (output instanceof Error) {
      advError(`Error while downloading video from Youtube! Url: ${youtubeUrl} - Error: ${output.message}`)
      await deleteFile()
      return { success: false, error: output.message }
    }
    if (!fs.existsSync(pathToSave)) {
      advError(`Error while downloading video from Youtube! Url: ${youtubeUrl} - Error: File not found!`)
      await deleteFile()
      return { success: false, error: 'File not found!' }
    }
    const readFileResult: {
      buffer: Buffer | Error | undefined
      readStream: ReadStream | Error | undefined
    } = {
      buffer: undefined,
      readStream: undefined
    }
    try {
      readFileResult.buffer = fs.readFileSync(pathToSave)
    } catch (err) {
      readFileResult.buffer = new Error(String(err))
    }
    if (readFileResult.buffer instanceof Error) {
      advError(`Error while reading file! File: ${id}.* - Error: ${readFileResult.buffer.message}`)
      await deleteFile()
      return { success: false, error: readFileResult.buffer.message }
    }
    if (readFileResult.buffer === undefined) {
      advError(`Error while reading file! File: ${id}.* - Error: Buffer is undefined!`)
      await deleteFile()
      return { success: false, error: 'Buffer is undefined!' }
    }
    await deleteFile()
    return {
      success: true,
      file: {
        buffer: readFileResult.buffer
      }
    }
  }

  async youtubeTrackAudioDownload (youtubeUrl: string): Promise<MsMusicApiError | MsMusicApiYoutubeTrackDownload> {
    if (!fs.existsSync(path.join(__dirname, './temp'))) {
      fs.mkdirSync(path.join(__dirname, './temp'))
    }
    const id = uuidv4()
    const pathToSave = path.join(__dirname, `./temp/${id}.mp3`)
    if (fs.existsSync(pathToSave)) {
      return {
        success: false,
        error: 'File already exists!'
      }
    }
    const output = await youtubedl.exec(youtubeUrl, {
      format: 'ba',
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      noPart: true,
      noPlaylist: true,
      output: pathToSave,
      maxFilesize: '10m'
    }).catch((err) => {
      return new Error(String(err))
    })
    const deleteFile = async (): Promise<void> => {
      try {
        fs.rmSync(pathToSave)
      } catch (err) {
        advError(`Error while deleting file! File: ${id}.* - Error: ${String(err)}`)
      }
    }
    if (output instanceof Error) {
      advError(`Error while downloading video from Youtube! Url: ${youtubeUrl} - Error: ${output.message}`)
      await deleteFile()
      return { success: false, error: output.message }
    }
    if (!fs.existsSync(pathToSave)) {
      advError(`Error while downloading video from Youtube! Url: ${youtubeUrl} - Error: File not found!`)
      await deleteFile()
      return { success: false, error: 'File not found!' }
    }
    const readFileResult: {
      buffer: Buffer | Error | undefined
      readStream: ReadStream | Error | undefined
    } = {
      buffer: undefined,
      readStream: undefined
    }
    try {
      readFileResult.buffer = fs.readFileSync(pathToSave)
    } catch (err) {
      readFileResult.buffer = new Error(String(err))
    }
    if (readFileResult.buffer instanceof Error) {
      advError(`Error while reading file! File: ${id}.* - Error: ${readFileResult.buffer.message}`)
      await deleteFile()
      return { success: false, error: readFileResult.buffer.message }
    }
    if (readFileResult.buffer === undefined) {
      advError(`Error while reading file! File: ${id}.* - Error: Buffer is undefined!`)
      await deleteFile()
      return { success: false, error: 'Buffer is undefined!' }
    }
    await deleteFile()
    return {
      success: true,
      file: {
        buffer: readFileResult.buffer
      }
    }
  }

  async getTrackPreviewBuffer (trackPreviewUrl: string): Promise<MsMusicApiError | MsMusicApiTrackPreviewDownload> {
    try {
      const response = await axios.get(trackPreviewUrl, {
        responseType: 'arraybuffer'
      }).catch((err) => {
        return new Error(String(err))
      })
      if (response instanceof Error) {
        return { success: false, error: response.message }
      }
      if (!(response.data instanceof Buffer)) {
        return { success: false, error: 'Response is not a buffer!' }
      }
      return {
        success: true,
        file: {
          buffer: response.data
        }
      }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }
}
