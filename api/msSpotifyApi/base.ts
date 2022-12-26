import { Client } from 'spotify-api.js'

interface MsSpotifyApiError {
  success: false
  error: string
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

  async getTrackPreviewUrl (track: string, artist: string): Promise<MsSpotifyApiError | {
    success: true
    url: string
  }> {
    if (this.client === null) return { success: false, error: 'Spotify client is not ready!' }
    const search = await this.client.search(`${track} ${artist}`, { types: ['track'] }).catch((err) => {
      return new Error(err)
    })
    if (search instanceof Error) return { success: false, error: search.message }
    if (search.tracks === undefined) return { success: false, error: 'No tracks found!' }
    if (search.tracks.length <= 0) return { success: false, error: 'No tracks found!' }
    if (search.tracks[0] === undefined) return { success: false, error: 'No preview URL found!' }
    const trackUrl = search.tracks[0].previewURL
    return {
      success: true,
      url: trackUrl
    }
  }
}
