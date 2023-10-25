import PromisePool from '@supercharge/promise-pool'
import { MsLastfmApi } from '../api/msLastfmApi/base'
import { type UserTopTracks } from '../api/msLastfmApi/types/zodUserTopTracks'
import { lastfmConfig } from '../config'
import { type AlbumInfo } from '../api/msLastfmApi/types/zodAlbumInfo'

export interface UserFilteredTopTracks {
  status: 'loading' | 'error' | 'success'
  data: Array<UserTopTracks['toptracks']['track']['0']>
}
export async function getUserFilteredTopTracks (lastfmUser: string, artistName: string | undefined, albumInfo: AlbumInfo['album'] | undefined): Promise<UserFilteredTopTracks> {
  const userFilteredTopTracks: UserFilteredTopTracks = {
    status: 'loading',
    data: []
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userTopTracks = await msLastfmApi.user.getTopTracks(lastfmUser, 1, 1)
  if (!userTopTracks.success) {
    userFilteredTopTracks.status = 'error'
    return userFilteredTopTracks
  }
  const userTopTracksPageLength = Math.ceil(Number(userTopTracks.data.toptracks['@attr'].total) / 1000)
  const allUserFilteredTopTracksResponses = await PromisePool.for(
    Array.from({ length: userTopTracksPageLength }, (_, index) => index + 1)
  ).withConcurrency(2).useCorrespondingResults().process(async (page, _index, pool) => {
    const userPartialTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 1000, page)
    const userTopTracks = await userPartialTopTracksRequest
    if (!userTopTracks.success) {
      pool.stop()
      return userTopTracks
    }
    for (const userTopTrack of userTopTracks.data.toptracks.track) {
      switch (true) {
        default: {
          if (artistName !== undefined) {
            if (userTopTrack.artist.name !== artistName) {
              break
            }
          }
          if (albumInfo !== undefined) {
            if (albumInfo.tracks === undefined) {
              if (userTopTrack.name !== albumInfo.name) {
                break
              }
            }
            if (albumInfo.tracks !== undefined) {
              if (!(albumInfo.tracks.track instanceof Array)) {
                if (userTopTrack.name !== albumInfo.tracks.track.name) {
                  break
                }
              }
              if (albumInfo.tracks.track instanceof Array) {
                if (!(albumInfo.tracks.track.some(track => track.name === userTopTrack.name))) {
                  break
                }
              }
            }
          }
          userFilteredTopTracks.data.push(userTopTrack)
        }
      }
    }
  })
  for (const userFilteredTopTracksResponse of allUserFilteredTopTracksResponses.results) {
    if (userFilteredTopTracksResponse === undefined) continue
    if (typeof userFilteredTopTracksResponse === 'symbol') continue
    userFilteredTopTracks.status = 'error'
    return userFilteredTopTracks
  }
  userFilteredTopTracks.data.sort((a, b) => Number(b.playcount) - Number(a.playcount))
  userFilteredTopTracks.status = 'success'
  return userFilteredTopTracks
}
