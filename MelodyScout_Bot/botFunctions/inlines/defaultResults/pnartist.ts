import { InlineQueryContext, Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { InlineQueryResultArticle } from 'grammy/types'
import { MsLastfmApi } from '../../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../../api/msPrismaDbApi/base'
import { lastfmConfig, melodyScoutConfig } from '../../../../config'
import { lang } from '../../../../translations/base'
import { UserTopTracks } from '../../../../api/msLastfmApi/types/zodUserTopTracks'
import { MsMusicApi } from '../../../../api/msMusicApi/base'
import PromisePool from '@supercharge/promise-pool'
import { getPnartistText } from '../../../textFabric/pnartist'

export async function pnartistInlineResult (ctxLang: string | undefined, msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: InlineQueryContext<Context>): Promise<InlineQueryResultArticle> {
  const resultId = 'PNARTIST'
  const resultName = 'Playing now artist!'
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'unableToGetUserIdErrorMessage'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserIdErrorMessage'), { parse_mode: 'HTML' })
    )
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'unableToGetUserInfoInDb'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserInfoInDb'), { parse_mode: 'HTML' })
    )
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmUserNotRegistered'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'lastfmUserNotRegistered'), { parse_mode: 'HTML' })
    )
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'unableToGetUserInfoInDb'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserInfoInDb'), { parse_mode: 'HTML' })
    )
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmUserNoMoreRegisteredError'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'lastfmUserNoMoreRegisteredError'), { parse_mode: 'HTML' })
    )
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1)
  const userTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 1, 1)
  const [userInfo, userRecentTracks, userTopTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest, userTopTracksRequest])
  if (!userInfo.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }), { parse_mode: 'HTML' })
    )
  }
  if (!userRecentTracks.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'unableToGetUserRecentTracksHistory'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'unableToGetUserRecentTracksHistory'), { parse_mode: 'HTML' })
    )
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'noRecentTracksError'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'noRecentTracksError'), { parse_mode: 'HTML' })
    )
  }
  if (!userTopTracks.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'getTopTracksErrorMessage'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'getTopTracksErrorMessage'), { parse_mode: 'HTML' })
    )
  }
  const mainTrack = {
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const spotifyArtistInfoRequest = msMusicApi.getSpotifyArtistInfo(mainTrack.artistName)
  const [artistInfo, spotifyArtistInfo] = await Promise.all([artistInfoRequest, spotifyArtistInfoRequest])
  if (!artistInfo.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'lastfmArtistDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'lastfmArtistDataNotFoundedError'), { parse_mode: 'HTML' })
    )
  }
  if (!spotifyArtistInfo.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'spotifyArtistDataNotFoundedError'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'spotifyArtistDataNotFoundedError'), { parse_mode: 'HTML' })
    )
  }
  const userArtistTopTracks: Array<UserTopTracks['toptracks']['track']['0']> = []
  const userTopTracksPageLength = Math.ceil(Number(userTopTracks.data.toptracks['@attr'].total) / 1000) + 1
  const allUserArtistTopTracksResponses = await PromisePool.for(
    Array.from({ length: userTopTracksPageLength }, (_, index) => index + 1)
  ).withConcurrency(5).process(async (page) => {
    const userPartialTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 1000, page)
    const userTopTracks = await userPartialTopTracksRequest
    return userTopTracks
  })
  for (const userArtistTopTracksResponse of allUserArtistTopTracksResponses.results) {
    if (!userArtistTopTracksResponse.success) {
      return (
        InlineQueryResultBuilder
          .article(resultId, resultName, {
            description: lang(ctxLang, 'getTopTracksErrorMessage'),
            thumbnail_url: melodyScoutConfig.userImgUrl
          })
          .text(lang(ctxLang, 'getTopTracksErrorMessage'), { parse_mode: 'HTML' })
      )
    }
    for (const userArtistTopTrack of userArtistTopTracksResponse.data.toptracks.track) {
      if (userArtistTopTrack.artist.name === mainTrack.artistName) {
        userArtistTopTracks.push(userArtistTopTrack)
      }
    }
  }
  userArtistTopTracks.sort((a, b) => Number(b.playcount) - Number(a.playcount))
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyArtistInfo.data.externalURL.spotify)
  return (
    InlineQueryResultBuilder
      .article(resultId, resultName, {
        description: `${artistInfo.data.artist.name}`,
        thumbnail_url: spotifyArtistInfo.data.images?.[0]?.url ?? artistInfo.data.artist.image[artistInfo.data.artist.image.length - 1]['#text'] ?? melodyScoutConfig.userImgUrl
      })
      .text(getPnartistText(ctxLang, userInfo.data, artistInfo.data, userArtistTopTracks, spotifyArtistInfo.data, mainTrack.nowPlaying), { parse_mode: 'HTML' })
  )
}
