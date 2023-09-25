import { InlineQueryContext, Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { InlineQueryResult } from 'grammy/types'
import { lang } from '../../../../translations/base'
import { getTrackpreviewText } from '../../../textFabric/trackpreview'
import { v4 as uuidv4 } from 'uuid'

export async function trackpreviewInlineResult (ctxLang: string | undefined, trackName: string, artistName: string, trackpreviewUrl: string, spotifyTrackUrl: string | undefined, deezerTrackUrl: string | undefined, youtubeTrackUrl: string | undefined, ctx: InlineQueryContext<Context>): Promise<{
  success: boolean
  result: InlineQueryResult
}> {
  const resultId = `TP:${uuidv4()}`
  const inlineKeyboard = new InlineKeyboard()
  if (spotifyTrackUrl !== undefined) inlineKeyboard.url(lang(ctxLang, 'spotifyButton'), spotifyTrackUrl)
  if (deezerTrackUrl !== undefined) inlineKeyboard.url(lang(ctxLang, 'deezerButton'), deezerTrackUrl)
  inlineKeyboard.row()
  if (youtubeTrackUrl !== undefined) inlineKeyboard.url(lang(ctxLang, 'youtubeButton'), youtubeTrackUrl)
  return {
    success: true,
    result: InlineQueryResultBuilder
      .audio(resultId, `Preview: ${trackName}`, trackpreviewUrl, {
        caption: getTrackpreviewText(ctxLang, trackName, artistName, ctx.from.id.toString(), ctx.from.first_name),
        performer: `By ${artistName}`,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      })
  }
}
