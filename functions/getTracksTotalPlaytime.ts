import PromisePool from '@supercharge/promise-pool'
import { MsDeezerApi } from '../api/msDeezerApi/base'
import { type UserTopTracks } from '../api/msLastfmApi/types/zodUserTopTracks'
import { MsMusicApi } from '../api/msMusicApi/base'
import { spotifyConfig } from '../config'
import { advLog, advError } from './advancedConsole'

const estimatedThreshold = 0.3

export type TracksTotalPlaytime = {
  status: 'loading' | 'error'
} | {
  status: 'success'
  totalPlaytime: number
}

interface Track {
  trackName: string
  trackArtist: string
  playcount: number
  trackDurationType: 'lastfm' | 'spotify' | 'deezer' | 'estimated' | undefined
  trackDuration: number | undefined
}

export async function getTracksTotalPlaytime (tracks: Array<UserTopTracks['toptracks']['track']['0']>): Promise<TracksTotalPlaytime> {
  const allTracks: {
    type: {
      undefined: {
        tracks: () => Track[]
        totalPlaycount: () => number
      }
      estimated: {
        tracks: () => Track[]
        totalPlaycount: () => number
      }
    }
    mediumTrackDuration: () => number
    totalPlaycount: () => number
    totalPlaytime: () => number
    tracks: Track[]
  } = {
    type: {
      undefined: {
        tracks: () => allTracks.tracks.filter(track => track.trackDurationType === undefined),
        totalPlaycount: () => allTracks.type.undefined.tracks().reduce((accumulator, track) => accumulator + track.playcount, 0)
      },
      estimated: {
        tracks: () => allTracks.tracks.filter(track => track.trackDurationType === 'estimated'),
        totalPlaycount: () => allTracks.type.estimated.tracks().reduce((accumulator, track) => accumulator + track.playcount, 0)
      }
    },
    mediumTrackDuration: () => {
      const validTracks = allTracks.tracks.filter(track => (track.trackDurationType !== undefined) && (track.trackDurationType !== 'estimated'))
      const totalPlaytime = validTracks.reduce((accumulator, track) => accumulator + ((track.trackDuration ?? 0) * track.playcount), 0)
      const totalPlaycount = validTracks.reduce((accumulator, track) => accumulator + track.playcount, 0)
      const mediumTrackDuration = totalPlaytime / totalPlaycount
      return mediumTrackDuration
    },
    totalPlaycount: () => allTracks.tracks.reduce((accumulator, track) => accumulator + track.playcount, 0),
    totalPlaytime: () => allTracks.tracks.reduce((accumulator, track) => accumulator + (track.trackDuration ?? 0), 0),
    tracks: []
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  for (const track of tracks) {
    const trackPlaycount = Number(track.playcount)
    const trackDuration = Number(track.duration)
    if (trackDuration > 0) {
      allTracks.tracks.push({
        trackName: track.name,
        trackArtist: track.artist.name,
        playcount: trackPlaycount,
        trackDurationType: 'lastfm',
        trackDuration
      })
      continue
    }
    allTracks.tracks.push({
      trackName: track.name,
      trackArtist: track.artist.name,
      playcount: trackPlaycount,
      trackDurationType: undefined,
      trackDuration: undefined
    })
  }
  if (allTracks.type.undefined.tracks().length > 150) {
    allTracks.tracks = allTracks.tracks.map(track => {
      if (track.trackDurationType === undefined) {
        track.trackDurationType = 'estimated'
      }
      return track
    })
  }
  const process = await PromisePool
    .for(allTracks.tracks)
    .withConcurrency(1)
    .useCorrespondingResults()
    .process(async (track, _index, _pool) => {
      if (track.trackDurationType !== undefined) {
        return track
      }
      const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(track.trackName, track.trackArtist)
      const deezerTrackInfoRequest = new MsDeezerApi().search.track(track.trackName, track.trackArtist, 1)
      const [spotifyTrackInfo, deezerTrackInfo] = await Promise.all([spotifyTrackInfoRequest, deezerTrackInfoRequest])
      if (spotifyTrackInfo.success && spotifyTrackInfo.data.length > 0) {
        track.trackDurationType = 'spotify'
        track.trackDuration = spotifyTrackInfo.data[0].duration_ms / 1000
        return track
      }
      if (deezerTrackInfo.success && deezerTrackInfo.data.data.length > 0) {
        track.trackDurationType = 'deezer'
        track.trackDuration = deezerTrackInfo.data.data[0].duration
        return track
      }
      track.trackDurationType = 'estimated'
      return track
    })
  const processResult: Track[] = []
  process.results.forEach(result => {
    if (typeof result === 'symbol') return
    processResult.push(result)
  })
  if (processResult.length !== allTracks.tracks.length) {
    advError(`GetTracksTotalPlaytime - The number of tracks (${allTracks.tracks.length}) is different from the number of results (${processResult.length})`)
    return {
      status: 'error'
    }
  }
  allTracks.tracks = processResult
  allTracks.tracks = allTracks.tracks.map(track => {
    if (track.trackDurationType !== 'estimated') return track
    track.trackDuration = allTracks.mediumTrackDuration()
    return track
  })
  if ((allTracks.type.estimated.totalPlaycount() / allTracks.totalPlaycount()) > estimatedThreshold) {
    advError(`GetTracksTotalPlaytime - The number of estimated tracks (${allTracks.type.estimated.totalPlaycount()}) is greater than ${estimatedThreshold * 100}% of the total number of tracks (${allTracks.totalPlaycount()})`)
    return {
      status: 'error'
    }
  }
  for (const track of allTracks.tracks) {
    if (track.trackDurationType === undefined) {
      advError(`GetTracksTotalPlaytime - The tracklist contains a track without a duration type: ${track.trackName} - ${track.trackArtist}`)
      return {
        status: 'error'
      }
    }
    if (track.trackDuration === undefined) {
      advError(`GetTracksTotalPlaytime - The tracklist contains a track without a duration: ${track.trackName} - ${track.trackArtist}`)
      return {
        status: 'error'
      }
    }
  }
  advLog(`GetTracksTotalPlaytime - Success!\n\nTracks length: ${allTracks.tracks.length}\nTotal playcount: ${allTracks.totalPlaycount()}\nTotal playtime: ${(allTracks.totalPlaytime() / 36000).toFixed(2)}h\n\nEstimated tracks length: ${allTracks.type.estimated.tracks().length}\nEstimated total playcount: ${allTracks.type.estimated.totalPlaycount()}\n\nMedium track duration: ${(allTracks.mediumTrackDuration() / 60).toFixed(2)}\n\nEstimated tracks percentage: ${(allTracks.type.estimated.totalPlaycount() / allTracks.totalPlaycount()) * 100}%`)
  return {
    status: 'success',
    totalPlaytime: allTracks.totalPlaytime()
  }
}
