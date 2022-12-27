import { Client } from 'spotify-api.js'
import { youtube } from 'scrape-youtube'
import ytStream from 'youtube-stream-url'

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
}

export interface MsMusicApiYoutubeTrackInfo {
  success: true
  videoWithAudioUrl: string
  audioUrl: string
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
    return {
      success: true,
      previewUrl,
      trackUrl,
      popularity,
      explicit
    }
  }

  async getYoutubeTrackInfo (track: string, artist: string): Promise<MsMusicApiError | MsMusicApiYoutubeTrackInfo> {
    const ytSearchResult = await youtube.search(`${track} - ${artist}`)
    console.log(ytSearchResult.videos[0])
    const ytStreamUrl = await ytStream.getInfo({ url: ytSearchResult.videos[0].link })
    if (ytStreamUrl === undefined) return { success: false, error: 'No formats found!' }
    const formats = ytStreamUrl.formats
    if (formats === undefined) return { success: false, error: 'No formats found!' }

    const audioFormats = formats.filter((format) => format.mimeType.includes('audio/mp4'))
    if (audioFormats === undefined) return { success: false, error: 'No audio formats found!' }
    if (audioFormats.length <= 0) return { success: false, error: 'Zero audio formats found!' }
    const audioFormatsSorted = audioFormats.sort((a, b) => b.bitrate - a.bitrate)
    const audioFormat = audioFormatsSorted.pop()
    if (audioFormat === undefined) return { success: false, error: 'No audio format found! (Sorted)' }

    const videoFormats = formats.filter((format) => format.mimeType.includes('video/mp4'))
    if (videoFormats === undefined) return { success: false, error: 'No video formats found!' }
    if (videoFormats.length <= 0) return { success: false, error: 'Zero video formats found!' }
    const videoWithAudioFormats = videoFormats.filter((format) => format.audioQuality !== undefined)
    const videoWithAudioFormatsSorted = videoWithAudioFormats.sort((a, b) => b.bitrate - a.bitrate)
    const videoWithAudioFormat = videoWithAudioFormatsSorted.pop()
    if (videoWithAudioFormat === undefined) return { success: false, error: 'No video format found! (Sorted)' }
    console.log(videoWithAudioFormat.url)
    return {
      success: true,
      videoWithAudioUrl: videoWithAudioFormat.url,
      audioUrl: audioFormat.url
    }
  }
}
