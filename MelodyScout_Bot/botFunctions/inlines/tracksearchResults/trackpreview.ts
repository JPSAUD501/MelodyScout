import { InlineQueryContext, Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { InlineQueryResult } from 'grammy/types'
import { lang } from '../../../../translations/base'
import { melodyScoutConfig } from '../../../../config'
import { getTrackpreviewText } from '../../../textFabric/trackpreview'
import { Track } from 'spotify-api.js'

export async function trackpreviewInlineResult (ctxLang: string | undefined, trackName: string, artistName: string, spotifyTrackInfo: Track, ctx: InlineQueryContext<Context>): Promise<InlineQueryResult> {
  const resultId = `TP:${spotifyTrackInfo.id}`
  const resultName = 'Download preview!'
  if (spotifyTrackInfo.previewURL === null) {
    return (
      InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'),
          thumbnail_url: melodyScoutConfig.logoImgUrl
        })
        .text(lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'), { parse_mode: 'HTML' })
    )
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyTrackInfo.externalURL.spotify)
  return (
    InlineQueryResultBuilder
      .audio(resultId, resultName, spotifyTrackInfo.previewURL, {
        caption: getTrackpreviewText(ctxLang, trackName, artistName, ctx.from.id.toString(), ctx.from.first_name),
        performer: `${trackName} - ${artistName}`,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      })
  )
}
