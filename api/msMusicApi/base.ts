import { Client, Track, Artist, Album } from 'spotify-api.js'
import { youtube } from 'scrape-youtube'
import ytStream from 'youtube-stream-url'
import { zodYtSteamInfo } from './types/zodYtStreamInfo'
import { AdvConsole } from '../../function/advancedConsole'
import youtubedl from 'youtube-dl-exec'
import fs from 'fs'
import path from 'path'
import { uuid } from 'uuidv4'

export interface MsMusicApiError {
  success: false
  error: string
}

export interface MsMusicApiSpotifyTrackInfo {
  success: true
  data: Track
}

export interface MsMusicApiSpotifyAlbumInfo {
  success: true
  data: Album
}

export interface MsMusicApiSpotifyArtistInfo {
  success: true
  data: Artist
}

export interface MsMusicApiYoutubeTrackInfo {
  success: true
  videoWithAudioRawUrl: string
  audioRawUrl: string
  videoUrl: string
}

export interface MsMusicApiYoutubeTrackDownloadAudio {
  success: true
  audioBuffer: Buffer
}

export class MsMusicApi {
  private readonly advConsole: AdvConsole
  private readonly clientID: string
  private readonly clientSecret: string
  private readonly clientPromise: Promise<Client>
  private client: Client | null = null

  constructor (advConsole: AdvConsole, clientID: string, clientSecret: string) {
    this.advConsole = advConsole
    this.clientID = clientID
    this.clientSecret = clientSecret
    this.clientPromise = Client.create({
      token: {
        clientID: this.clientID,
        clientSecret: this.clientSecret
      }
    })
  }

  async start (): Promise<void> {
    this.client = await this.clientPromise
  }

  async getSpotifyTrackInfo (track: string, artist: string): Promise<MsMusicApiError | MsMusicApiSpotifyTrackInfo> {
    if (this.client === null) return { success: false, error: 'Spotify client is not ready!' }
    const search = await this.client.tracks.search(`${track} ${artist}`, { includeExternalAudio: true }).catch((err) => {
      return new Error(err)
    })
    if (search instanceof Error) {
      this.advConsole.error(`Error while getting track info from Spotify! Track: ${track} Artist: ${artist} - Error: ${search.message}`)
      return { success: false, error: search.message }
    }
    if (search.length <= 0) return { success: false, error: 'No tracks found!' }
    return {
      success: true,
      data: search[0]
    }
  }

  async getSpotifyArtistInfo (artist: string): Promise<MsMusicApiError | MsMusicApiSpotifyArtistInfo> {
    if (this.client === null) return { success: false, error: 'Spotify client is not ready!' }
    const search = await this.client.artists.search(`${artist}`, { includeExternalAudio: true }).catch((err) => {
      return new Error(err)
    })
    if (search instanceof Error) {
      this.advConsole.error(`Error while getting artist info from Spotify! Artist: ${artist} - Error: ${search.message}`)
      return { success: false, error: search.message }
    }
    if (search.length <= 0) return { success: false, error: 'No artists found!' }
    return {
      success: true,
      data: search[0]
    }
  }

  async getSpotifyAlbumInfo (album: string, artist: string): Promise<MsMusicApiError | MsMusicApiSpotifyAlbumInfo> {
    if (this.client === null) return { success: false, error: 'Spotify client is not ready!' }
    const search = await this.client.albums.search(`${album} ${artist}`, { includeExternalAudio: true }).catch((err) => {
      return new Error(err)
    })
    if (search instanceof Error) {
      this.advConsole.error(`Error while getting album info from Spotify! Album: ${album} Artist: ${artist} - Error: ${search.message}`)
      return { success: false, error: search.message }
    }
    if (search.length <= 0) return { success: false, error: 'No albums found!' }
    return {
      success: true,
      data: search[0]
    }
  }

  async getYoutubeTrackInfo (track: string, artist: string): Promise<MsMusicApiError | MsMusicApiYoutubeTrackInfo> {
    const ytSearchResult = await youtube.search(`${track} - ${artist}`)
    if (ytSearchResult.videos.length <= 0) return { success: false, error: 'No videos found!' }
    const video = ytSearchResult.videos[0]
    const ytStreamInfoResponse = await ytStream.getInfo({ url: video.link })
    const ytStreamInfo = zodYtSteamInfo.safeParse(ytStreamInfoResponse)
    if (!ytStreamInfo.success) {
      this.advConsole.error(`Error while getting track info from Youtube! YtStream info is not valid! Track: ${track} Artist: ${artist} - Error: ${JSON.stringify(ytStreamInfo.error, null, 2)}`)
      return { success: false, error: 'YtStream info is not valid!' }
    }
    const formats = ytStreamInfo.data.formats

    const audioFormats = formats.filter((format) => format.mimeType.includes('audio/mp4')).sort((a, b) => b.bitrate - a.bitrate)
    if (audioFormats.length <= 0) return { success: false, error: 'No audio formats found!' }
    const audioFormat = audioFormats[0]

    const videoFormats = formats.filter((format) => format.mimeType.includes('video/mp4')).filter((format) => format.audioQuality !== undefined).sort((a, b) => b.bitrate - a.bitrate)
    if (videoFormats.length <= 0) return { success: false, error: 'No video formats found!' }
    const videoWithAudioFormat = videoFormats[0]

    return {
      success: true,
      videoWithAudioRawUrl: videoWithAudioFormat.url,
      audioRawUrl: audioFormat.url,
      videoUrl: video.link
    }
  }

  async youtubeTrackDownloadAudio (youtubeUrl: string): Promise<MsMusicApiError | MsMusicApiYoutubeTrackDownloadAudio> {
    if (!fs.existsSync(path.join(__dirname, './temp'))) {
      fs.mkdirSync(path.join(__dirname, './temp'))
    }
    const id = uuid()
    const pathToSave = path.join(__dirname, `./temp/${id}.webm`)
    if (fs.existsSync(pathToSave)) {
      return {
        success: false,
        error: 'File already exists!'
      }
    }
    const output = await youtubedl.exec(youtubeUrl, {
      format: 'bestaudio',
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      noPart: true,
      noPlaylist: true,
      output: pathToSave
    }).catch((err) => {
      return new Error(String(err))
    })
    const deleteFile = async (): Promise<void> => {
      try {
        fs.rmSync(pathToSave)
      } catch (err) {
        this.advConsole.error(`Error while deleting file! File: ${id}.webm - Error: ${String(err)}`)
      }
    }
    if (output instanceof Error) {
      this.advConsole.error(`Error while downloading audio from Youtube! Url: ${youtubeUrl} - Error: ${output.message}`)
      await deleteFile()
      return { success: false, error: output.message }
    }
    if (!fs.existsSync(pathToSave)) {
      this.advConsole.error(`Error while downloading audio from Youtube! Url: ${youtubeUrl} - Error: File not found!`)
      await deleteFile()
      return { success: false, error: 'File not found!' }
    }
    const readFileResult: {
      result: Buffer | Error | undefined
    } = {
      result: undefined
    }
    try {
      readFileResult.result = fs.readFileSync(pathToSave)
    } catch (err) {
      readFileResult.result = new Error(String(err))
    }
    if (readFileResult.result instanceof Error) {
      this.advConsole.error(`Error while reading file! File: ${id}.webm - Error: ${readFileResult.result.message}`)
      await deleteFile()
      return { success: false, error: readFileResult.result.message }
    }
    if (readFileResult.result === undefined) {
      this.advConsole.error(`Error while reading file! File: ${id}.webm - Error: Buffer is undefined!`)
      await deleteFile()
      return { success: false, error: 'Buffer is undefined!' }
    }
    await deleteFile()
    return {
      success: true,
      audioBuffer: readFileResult.result
    }
  }
}
