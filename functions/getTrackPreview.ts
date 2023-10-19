import { MsDeezerApi } from '../api/msDeezerApi/base'
import { MsMusicApi } from '../api/msMusicApi/base'
import { spotifyConfig } from '../config'

export async function getTrackPreview (trackName: string, trackArtist: string): Promise<{
  success: true
  previewUrl: string
} | {
  success: false
  error: string
}> {
  const spotifyTrackInfoPromise = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret).getSpotifyTrackInfo(trackName, trackArtist)
  const deezerSearchTrackPromise = new MsDeezerApi().search.track(trackName, trackArtist, 1)
  const [spotifyTrackInfo, deezerSearchTrack] = await Promise.all([spotifyTrackInfoPromise, deezerSearchTrackPromise])
  const previewUrls: string[] = []
  if (spotifyTrackInfo.success) {
    if (spotifyTrackInfo.data.length >= 1) {
      if (spotifyTrackInfo.data[0].preview_url !== null) previewUrls.push(spotifyTrackInfo.data[0].preview_url)
    }
  }
  if (deezerSearchTrack.success) {
    if (deezerSearchTrack.data.data.length >= 1) {
      if (deezerSearchTrack.data.data[0].preview !== null) previewUrls.push(deezerSearchTrack.data.data[0].preview)
    }
  }
  if (previewUrls.length <= 0) {
    return {
      success: false,
      error: 'Track preview url not founded'
    }
  }
  return {
    success: true,
    previewUrl: previewUrls[0]
  }
}
