import { Client } from 'spotify-api.js'
import { youtube } from 'scrape-youtube'
import ytStream from 'youtube-stream-url'
import { zodYtSteamInfo } from './types/zodYtStreamInfo'

interface MsMusicApiError {
  success: false
  error: string
}

export interface MsMusicApiSpotifyTrackInfo {
  success: true
  previewUrl: string
  trackUrl: string
  popularity: number | undefined
  explicit: boolean
  duration: number
}

export interface MsMusicApiYoutubeTrackInfo {
  success: true
  videoWithAudioRawUrl: string
  audioRawUrl: string
  videoUrl: string
}

export class MsMusicApi {
  private readonly clientID: string
  private readonly clientSecret: string
  private readonly clientPromise: Promise<Client>
  private client: Client | null = null

  constructor (clientID: string, clientSecret: string) {
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
    const search = await this.client.search(`${track} ${artist}`, { types: ['track'] }).catch((err) => {
      return new Error(err)
    })
    if (search instanceof Error) return { success: false, error: search.message }
    if (search.tracks === undefined) return { success: false, error: 'No tracks found!' }
    if (search.tracks.length <= 0) return { success: false, error: 'No tracks found!' }
    if (search.tracks[0] === undefined) return { success: false, error: 'No preview URL found!' }
    const previewUrl = search.tracks[0].previewURL
    if (previewUrl.length <= 0) return { success: false, error: 'Preview URL is empty!' }
    const trackUrl = search.tracks[0].externalURL.spotify
    if (trackUrl.length <= 0) return { success: false, error: 'Track URL is empty!' }
    const popularity = search.tracks[0].popularity
    const explicit = search.tracks[0].explicit
    const duration = search.tracks[0].duration
    return {
      success: true,
      previewUrl,
      trackUrl,
      popularity,
      explicit,
      duration
    }
  }

  async getYoutubeTrackInfo (track: string, artist: string): Promise<MsMusicApiError | MsMusicApiYoutubeTrackInfo> {
    const ytSearchResult = await youtube.search(`${track} - ${artist}`)
    if (ytSearchResult.videos.length <= 0) return { success: false, error: 'No videos found!' }
    const video = ytSearchResult.videos[0]
    const ytStreamInfoResponse = await ytStream.getInfo({ url: video.link })
    const ytStreamInfo = zodYtSteamInfo.safeParse(ytStreamInfoResponse)
    if (!ytStreamInfo.success) {
      console.log(JSON.stringify(ytStreamInfo.error, null, 2))
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
}
