import { InlineQueryContext, Context, InlineQueryResultBuilder } from 'grammy'
import { InlineQueryResultArticle } from 'grammy/types'
import { MsLastfmApi } from '../../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../../api/msPrismaDbApi/base'
import { lastfmConfig, melodyScoutConfig } from '../../../../config'
import { lang } from '../../../../translations/base'
import { getBriefText } from '../../../textFabric/brief'

export async function briefInlineResult (ctxLang: string | undefined, msPrismaDbApi: MsPrismaDbApi, ctx: InlineQueryContext<Context>): Promise<InlineQueryResultArticle> {
  const resultId = 'BRIEF'
  const resultName = 'Your musical brief!'
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
  const userTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 5, 1)
  const userTopAlbumsRequest = msLastfmApi.user.getTopAlbums(lastfmUser, 5)
  const userTopArtistsRequest = msLastfmApi.user.getTopArtists(lastfmUser, 5)
  const [userInfo, userTopTracks, userTopAlbums, userTopArtists] = await Promise.all([userInfoRequest, userTopTracksRequest, userTopAlbumsRequest, userTopArtistsRequest])
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
  if (!userTopAlbums.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'getTopAlbumsErrorMessage'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'getTopAlbumsErrorMessage'), { parse_mode: 'HTML' })
    )
  }
  if (!userTopArtists.success) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'getTopArtistsErrorMessage'),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, 'getTopArtistsErrorMessage'), { parse_mode: 'HTML' })
    )
  }
  return (
    InlineQueryResultBuilder
      .article(resultId, resultName, {
        description: `${userInfo.data.user.name} - ${userInfo.data.user.realname}`,
        thumbnail_url: userInfo.data.user.image[userInfo.data.user.image.length - 1]['#text'] ?? melodyScoutConfig.userImgUrl
      })
      .text(getBriefText(ctxLang, userInfo.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data), { parse_mode: 'HTML' })
  )
}
