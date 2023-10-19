import { type Context, type InlineQueryContext, InlineQueryResultBuilder } from 'grammy'
import { ctxAnswerInlineQuery } from '../../../functions/grammyFunctions'

import { type InlineQueryResult } from 'grammy/types'
import { PromisePool } from '@supercharge/promise-pool'
import { melodyScoutConfig, spotifyConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { trackpreviewInlineResult } from './tracksearchResults/trackpreview'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'

export async function runTracksearchInline (ctx: InlineQueryContext<Context>): Promise<void> {
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
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
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
        youtubeMusic: string | undefined
      } = {
        spotify: undefined,
        deezer: undefined,
        youtube: undefined,
        youtubeMusic: undefined
      }
      if (spotifyTrackInfo.success) {
        if (spotifyTrackInfo.data[0].preview_url !== null) previewUrls.push(spotifyTrackInfo.data[0].preview_url)
        trackUrl.spotify = spotifyTrackInfo.data[0].external_urls.spotify
      }
      if (deezerSearchTrack.success) {
        if (deezerSearchTrack.data.data[0].preview !== null) previewUrls.push(deezerTrack.preview)
        trackUrl.deezer = deezerTrack.link
      }
      if (youtubeTrackInfo.success) {
        trackUrl.youtube = youtubeTrackInfo.videoMusicUrl
        trackUrl.youtubeMusic = youtubeTrackInfo.videoMusicUrl
      }
      if (previewUrls.length <= 0) {
        return
      }
      const trackpreviewInlineResultResponse = await trackpreviewInlineResult(ctxLang, deezerTrack.title, deezerTrack.artist.name, previewUrls[0], trackUrl.spotify, trackUrl.deezer, trackUrl.youtube, trackUrl.youtubeMusic, ctx)
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
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 60 * 60 * 24 })
    return
  }

  await ctxAnswerInlineQuery(ctx, inlineQueryResults, { cache_time: 60 })
}
