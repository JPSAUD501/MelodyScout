import PromisePool from '@supercharge/promise-pool'
import { MsDeezerApi } from '../api/msDeezerApi/base'
import { type UserTopTracks } from '../api/msLastfmApi/types/zodUserTopTracks'
import { MsMusicApi } from '../api/msMusicApi/base'
import { spotifyConfig } from '../config'
import { advLog, advError } from './advancedConsole'

export type TracksTotalPlaytime = {
  status: 'loading' | 'error'
} | {
  status: 'success'
  totalPlaytime: number
}
export async function getTracksTotalPlaytime (tracks: Array<UserTopTracks['toptracks']['track']['0']>): Promise<TracksTotalPlaytime> {
  const success = {
    tracksLength: 0,
    totalPlaytime: 0
  }
  const estimated = {
    tracksLength: 0,
    totalPlaytime: 0
  }
  const errors = {
    tracksLength: 0,
    totalPlaytime: 0
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const tracksWithNoDuration: Array<UserTopTracks['toptracks']['track']['0']> = []
  for (const track of tracks) {
    const trackPlaycount = Number(track.playcount)
    const trackDuration = Number(track.duration)
    if (trackDuration > 0) {
      success.tracksLength += trackPlaycount
      success.totalPlaytime += trackDuration * trackPlaycount
      continue
    }
    tracksWithNoDuration.push(track)
  }
  advLog(`GetTracksTotalPlaytime - Tracks with no duration: ${tracksWithNoDuration.length} / ${tracks.length} - ${((tracksWithNoDuration.length / tracks.length) * 100).toFixed(2)}%`)
  switch (true) {
    case tracksWithNoDuration.length <= 0: {
      break
    }
    case tracksWithNoDuration.length > 150: {
      advLog(`GetTracksTotalPlaytime - Tracks with no duration: ${tracksWithNoDuration.length} - Using median track duration`)
      const medianTrackDuration = success.totalPlaytime / success.tracksLength
      tracksWithNoDuration.forEach(track => {
        const trackPlaycount = Number(track.playcount)
        estimated.tracksLength += trackPlaycount
        estimated.totalPlaytime += medianTrackDuration * trackPlaycount
      })
      advLog(`GetTracksTotalPlaytime - Estimated total playcount: ${estimated.tracksLength} - Estimated total playtime: ${estimated.totalPlaytime} - Median track duration: ${medianTrackDuration}`)
      if (estimated.tracksLength > (success.tracksLength * 0.3)) {
        advError(`GetTracksTotalPlaytime - The estimated playcount are more than 30% of the total playcount - Estimated playcount: ${estimated.tracksLength} - Total playcount: ${success.tracksLength} - ${((estimated.tracksLength / success.tracksLength) * 100).toFixed(2)}%`)
        return {
          status: 'error'
        }
      }
      break
    }
    default: {
      await PromisePool.for(tracksWithNoDuration).withConcurrency(1).process(async (track, _index, _pool) => {
        const trackPlaycount = Number(track.playcount)
        const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(track.name, track.artist.name)
        const deezerTrackInfoRequest = new MsDeezerApi().search.track(track.name, track.artist.name, 1)
        const [spotifyTrackInfo, deezerTrackInfo] = await Promise.all([spotifyTrackInfoRequest, deezerTrackInfoRequest])
        switch (true) {
          default: {
            if (spotifyTrackInfo.success && spotifyTrackInfo.data.length > 0) {
              success.tracksLength += trackPlaycount
              success.totalPlaytime += (spotifyTrackInfo.data[0].duration_ms / 1000) * trackPlaycount
              break
            }
            if (deezerTrackInfo.success && deezerTrackInfo.data.data.length > 0) {
              success.tracksLength += trackPlaycount
              success.totalPlaytime += deezerTrackInfo.data.data[0].duration * trackPlaycount
              break
            }
            errors.tracksLength += trackPlaycount
            break
          }
        }
      })
      advLog(`GetTracksTotalPlaytime - Fetched tracks: ${tracksWithNoDuration.length} - Success tracks: ${success.tracksLength} - Error tracks: ${errors.tracksLength} - ${((errors.tracksLength / tracksWithNoDuration.length) * 100).toFixed(2)}%`)
      const errorPercentage = errors.tracksLength / success.tracksLength
      if (errorPercentage > 0.3) {
        return {
          status: 'error'
        }
      }
    }
  }
  success.tracksLength += estimated.tracksLength
  success.totalPlaytime += estimated.totalPlaytime
  const finalMedianTrackDuration = success.totalPlaytime / success.tracksLength
  advLog(`GetTracksTotalPlaytime - Final median track duration: ${finalMedianTrackDuration}`)
  errors.totalPlaytime = errors.tracksLength * finalMedianTrackDuration
  success.totalPlaytime += errors.totalPlaytime
  advLog(`GetTracksTotalPlaytime - Final total playtime: ${success.totalPlaytime}`)
  return {
    status: 'success',
    totalPlaytime: success.totalPlaytime
  }
}
