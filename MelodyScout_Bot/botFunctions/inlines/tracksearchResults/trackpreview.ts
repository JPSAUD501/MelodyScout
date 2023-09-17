import { InlineQueryContext, Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { InlineQueryResult } from 'grammy/types'
import { lang } from '../../../../translations/base'
import { melodyScoutConfig } from '../../../../config'
import { getTrackpreviewText } from '../../../textFabric/trackpreview'
import { Track } from 'spotify-api.js'
import { v4 as uuidv4 } from 'uuid'

export async function trackpreviewInlineResult (ctxLang: string | undefined, trackName: string, artistName: string, spotifyTrackInfo: Track, ctx: InlineQueryContext<Context>): Promise<{
  success: boolean
  result: InlineQueryResult
}> {
  const resultId = `TP:${uuidv4()}`
  const resultName = 'Download preview!'
  if (spotifyTrackInfo.previewURL === null) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'),
          thumbnail_url: melodyScoutConfig.logoImgUrl
        })
        .text(lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'), { parse_mode: 'HTML' })
    }
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyTrackInfo.externalURL.spotify)
  return {
    success: true,
    result: InlineQueryResultBuilder
      .audio(resultId, `Preview: ${trackName}`, spotifyTrackInfo.previewURL, {
        caption: getTrackpreviewText(ctxLang, trackName, artistName, ctx.from.id.toString(), ctx.from.first_name),
        performer: `${artistName}`,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      })
  }
}
