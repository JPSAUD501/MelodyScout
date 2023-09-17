import { Context, InlineQueryContext, InlineQueryResultBuilder } from 'grammy'
import { ctxAnswerInlineQuery } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { InlineQueryResult } from 'grammy/types'
import { PromisePool } from '@supercharge/promise-pool'
import { lastfmConfig, melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { trackpreviewInlineResult } from './tracksearchResults/trackpreview'

export async function runTracksearchInline (msMusicApi: MsMusicApi, ctx: InlineQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const inlineQueryResults: InlineQueryResult[] = []

  const searchTrackName = ctx.inlineQuery.query.trim()
  if (searchTrackName.length <= 0) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'),
        thumbnail_url: melodyScoutConfig.logoImgUrl
      })
      .text(lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const lastfmSearchTrack = await new MsLastfmApi(lastfmConfig.apiKey).track.search(searchTrackName, '', 5)
  if (!lastfmSearchTrack.success) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'lastfmTrackDataNotFoundedError'),
        thumbnail_url: melodyScoutConfig.logoImgUrl
      })
      .text(lang(ctxLang, 'lastfmTrackDataNotFoundedError'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const lastfmSearchTrackResults = lastfmSearchTrack.data.results.trackmatches.track
  if (lastfmSearchTrackResults.length <= 0) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'lastfmTrackDataNotFoundedError'),
        thumbnail_url: melodyScoutConfig.logoImgUrl
      })
      .text(lang(ctxLang, 'lastfmTrackDataNotFoundedError'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const inlineQueryResultsPromisePool = await PromisePool
    .for(lastfmSearchTrackResults)
    .withConcurrency(lastfmSearchTrackResults.length)
    .useCorrespondingResults()
    .process(async (track) => {
      const spotifyTrackInfo = await msMusicApi.getSpotifyTrackInfo(track.name, track.artist)
      if (!spotifyTrackInfo.success) {
        return
      }
      const trackpreviewInlineResultResponse = await trackpreviewInlineResult(ctxLang, spotifyTrackInfo.data[0].name, spotifyTrackInfo.data[0].artists[0].name, spotifyTrackInfo.data[0], ctx)
      if (!trackpreviewInlineResultResponse.success) {
        return
      }
      return trackpreviewInlineResultResponse.result
    })
  for (const inlineQueryResult of inlineQueryResultsPromisePool.results) {
    if (inlineQueryResult === undefined) continue
    if (typeof inlineQueryResult === 'symbol') continue
    inlineQueryResults.push(inlineQueryResult)
  }
  if (inlineQueryResults.length <= 0) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'),
        thumbnail_url: melodyScoutConfig.logoImgUrl
      })
      .text(lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }

  await ctxAnswerInlineQuery(ctx, inlineQueryResults, { cache_time: 60 })
}
