import { type InlineQueryContext, type Context, InlineQueryResultBuilder, InlineKeyboard } from 'grammy'
import { type InlineQueryResult } from 'grammy/types'
import { lang } from '../../../../translations/base'
import { getTrackpreviewText } from '../../../textFabric/trackpreview'
import { randomUUID } from 'crypto'

export async function trackpreviewInlineResult (ctxLang: string | undefined, trackName: string, artistName: string, trackpreviewUrl: string, spotifyTrackUrl: string | undefined, deezerTrackUrl: string | undefined, youtubeTrackUrl: string | undefined, youtubeMusicTrackUrl: string | undefined, ctx: InlineQueryContext<Context>): Promise<{
  success: boolean
  result: InlineQueryResult
}> {
  const resultId = `TP:${randomUUID()}`
  const inlineKeyboard = new InlineKeyboard()
  if (spotifyTrackUrl !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'spotifyButton', value: '[🎧] - Spotify' }), spotifyTrackUrl)
  if (deezerTrackUrl !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'deezerButton', value: '[🎧] - Deezer' }), deezerTrackUrl)
  inlineKeyboard.row()
  if (youtubeTrackUrl !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeButton', value: '[🎥] - YouTube' }), youtubeTrackUrl)
  if (youtubeMusicTrackUrl !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeMusicButton', value: '[🎶] - YT Music' }), youtubeMusicTrackUrl)
  return {
    success: true,
    result: InlineQueryResultBuilder
      .audio(resultId, lang(ctxLang, { key: 'trackpreviewInlineResultTrackName', value: 'Pre-visualização: {{trackName}}' }, { trackName }), trackpreviewUrl, {
        caption: getTrackpreviewText(ctxLang, trackName, artistName, ctx.from.id.toString(), ctx.from.first_name),
        performer: lang(ctxLang, { key: 'trackpreviewInlineResultByArtistName', value: 'Por {{artistName}}' }, { artistName }),
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      })
  }
}
