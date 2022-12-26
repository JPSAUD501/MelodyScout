import { Client } from 'spotify-api.js'

interface MsSpotifyApiError {
  success: false
  error: string
}

export interface MsSpotifyTrackInfo {
  success: true
  previewUrl: string
  trackUrl: string
  popularity: number | undefined
  explicit: boolean
}

export class MsSpotifyApi {
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

  async getTrackInfo (track: string, artist: string): Promise<MsSpotifyApiError | MsSpotifyTrackInfo> {
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
}
