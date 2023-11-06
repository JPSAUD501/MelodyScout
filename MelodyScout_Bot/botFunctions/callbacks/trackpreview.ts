import { type CallbackQueryContext, type Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReplyWithAudio } from '../../../functions/grammyFunctions'

import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getTrackpreviewText } from '../../textFabric/trackpreview'
import { getTrackPreview } from '../../../functions/getTrackPreview'

export async function runTrackpreviewCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    await ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'lastfmTrackOrArtistDataNotFoundedErrorCallback', value: '⚠ - Nome da música ou do artista não encontrado!' }))
    return
  }
  const trackPreview = await getTrackPreview(track, artist, undefined)
  if (!trackPreview.success) {
    await ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'trackPreviewUrlNotFoundedErrorCallback', value: '⚠ - Não encontrei o preview dessa musica!' }))
    return
  }
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'sendingTrackPreviewInformCallback', value: '🎵 - Enviando preview da música' }))
  await ctxReplyWithAudio(ctx, new InputFile({ url: trackPreview.previewUrl }, track), {
    title: track,
    performer: artist,
    caption: getTrackpreviewText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name),
    reply_to_message_id: messageId,
    allow_sending_without_reply: true
  })
}
