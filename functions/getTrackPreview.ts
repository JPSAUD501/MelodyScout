import { MsDeezerApi } from '../api/msDeezerApi/base'
import { type MsMusicApi } from '../api/msMusicApi/base'

export async function getTrackPreview (msMusicApi: MsMusicApi, trackName: string, trackArtist: string): Promise<{}> {
  const spotifyTrackInfoPromise = msMusicApi.getSpotifyTrackInfo(trackName, trackArtist)
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
    await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'))
  }
}
