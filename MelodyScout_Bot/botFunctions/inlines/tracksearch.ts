import { Context, InlineQueryContext, InlineQueryResultBuilder } from 'grammy'
import { ctxAnswerInlineQuery } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { InlineQueryResult } from 'grammy/types'
import { trackpreviewInlineResult } from './tracksearchResults/trackpreview'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'

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
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 5 })
    return
  }
  const spotifyTrackInfo = await msMusicApi.getSpotifyTrackInfo(searchTrackName, '')
  if (!spotifyTrackInfo.success) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'spotifyTrackDataNotFoundedError'),
        thumbnail_url: melodyScoutConfig.logoImgUrl
      })
      .text(lang(ctxLang, 'spotifyTrackDataNotFoundedError'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 5 })
    return
  }
  const trackpreviewInlineResultPromises: Array<Promise<InlineQueryResult>> = []
  for (let i = 1; i < spotifyTrackInfo.data.length && i <= 10; i++) {
    trackpreviewInlineResultPromises.push(trackpreviewInlineResult(ctxLang, spotifyTrackInfo.data[i].name, spotifyTrackInfo.data[i].artists[0].name, spotifyTrackInfo.data[i], ctx))
  }
  const inlineResults = await Promise.all(trackpreviewInlineResultPromises)
  inlineQueryResults.push(...inlineResults)

  await ctxAnswerInlineQuery(ctx, inlineQueryResults, { cache_time: 10 })
}
