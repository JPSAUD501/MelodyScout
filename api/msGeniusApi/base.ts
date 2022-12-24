import { getLyrics } from 'genius-lyrics-api'

export class MsGeniusApi {
  private readonly accessToken: string

  constructor (accessToken: string) {
    this.accessToken = accessToken
  }

  async getLyrics (track: string, artist: string): Promise<string | null> {
    const lyrics = await getLyrics({
      apiKey: this.accessToken,
      title: track,
      artist,
      optimizeQuery: true
    })

    return lyrics
  }
}
