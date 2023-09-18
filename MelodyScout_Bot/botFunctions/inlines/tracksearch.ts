import { Context, InlineQueryContext, InlineQueryResultBuilder } from 'grammy'
import { ctxAnswerInlineQuery } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { InlineQueryResult } from 'grammy/types'
import { PromisePool } from '@supercharge/promise-pool'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { trackpreviewInlineResult } from './tracksearchResults/trackpreview'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'

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
  // const lastfmSearchTrack = await new MsLastfmApi(lastfmConfig.apiKey).track.search(searchTrackName, '', 5)
  // if (!lastfmSearchTrack.success) {
  //   const inlineQueryResultError = InlineQueryResultBuilder
  //     .article('ERROR', 'An error occurred!', {
  //       description: lang(ctxLang, 'lastfmTrackDataNotFoundedError'),
  //       thumbnail_url: melodyScoutConfig.logoImgUrl
  //     })
  //     .text(lang(ctxLang, 'lastfmTrackDataNotFoundedError'), { parse_mode: 'HTML' })
  //   void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
  //   return
  // }
  // const lastfmSearchTrackResults = lastfmSearchTrack.data.results.trackmatches.track
  // if (lastfmSearchTrackResults.length <= 0) {
  //   const inlineQueryResultError = InlineQueryResultBuilder
  //     .article('ERROR', 'An error occurred!', {
  //       description: lang(ctxLang, 'lastfmTrackDataNotFoundedError'),
  //       thumbnail_url: melodyScoutConfig.logoImgUrl
  //     })
  //     .text(lang(ctxLang, 'lastfmTrackDataNotFoundedError'), { parse_mode: 'HTML' })
  //   void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
  //   return
  // }
  const deezerSearchTrack = await new MsDeezerApi().search.track(searchTrackName, '', 10)
  if (!deezerSearchTrack.success) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: 'Ocorreu um erro ao procurar pela musica',
        thumbnail_url: melodyScoutConfig.logoImgUrl
      })
      .text('Ocorreu um erro ao procurar pela musica', { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const deezerSearchTrackResults = deezerSearchTrack.data.data
  if (deezerSearchTrackResults.length <= 0) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: 'Nenhum resultado encontrado',
        thumbnail_url: melodyScoutConfig.logoImgUrl
      })
      .text('Nenhum resultado encontrado', { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const inlineQueryResultsPromisePool = await PromisePool
    .for(deezerSearchTrackResults)
    .withConcurrency(deezerSearchTrackResults.length)
    .useCorrespondingResults()
    .process(async (deezerTrack) => {
      const spotifyTrackInfoPromise = msMusicApi.getSpotifyTrackInfo(deezerTrack.title, deezerTrack.artist.name)
      const youtubeTrackInfoPromise = msMusicApi.getYoutubeTrackInfo(deezerTrack.title, deezerTrack.artist.name)
      const [spotifyTrackInfo, youtubeTrackInfo] = await Promise.all([spotifyTrackInfoPromise, youtubeTrackInfoPromise])
      const previewUrls: string[] = []
      const trackUrl: {
        spotify: string | undefined
        deezer: string | undefined
        youtube: string | undefined
      } = {
        spotify: undefined,
        deezer: undefined,
        youtube: undefined
      }
      if (deezerSearchTrack.success) {
        if (deezerSearchTrack.data.data[0].preview !== null) previewUrls.push(deezerTrack.preview)
        trackUrl.deezer = deezerTrack.link
      }
      if (spotifyTrackInfo.success) {
        if (spotifyTrackInfo.data[0].previewURL !== null) previewUrls.push(spotifyTrackInfo.data[0].previewURL)
        trackUrl.spotify = spotifyTrackInfo.data[0].externalURL.spotify
      }
      if (youtubeTrackInfo.success) {
        trackUrl.youtube = youtubeTrackInfo.videoUrl
      }
      if (previewUrls.length <= 0) {
        return
      }
      const trackpreviewInlineResultResponse = await trackpreviewInlineResult(ctxLang, deezerTrack.title, deezerTrack.artist.name, previewUrls[0], trackUrl.spotify, trackUrl.deezer, trackUrl.youtube, ctx)
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
