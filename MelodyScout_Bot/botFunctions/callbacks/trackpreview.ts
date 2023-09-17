import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithAudio } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getTrackpreviewText } from '../../textFabric/trackpreview'

export async function runTrackpreviewCallback (msMusicApi: MsMusicApi, ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'dontWorkOnChannelsInformCallback'))
    return
  }
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) return await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'lastfmTrackOrArtistDataNotFoundedErrorCallback'))
  const spotifyTrackInfo = await msMusicApi.getSpotifyTrackInfo(track, artist)
  if (!spotifyTrackInfo.success) return await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'))
  if (spotifyTrackInfo.data[0].previewURL === null) return await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'))
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'sendingTrackPreviewInformCallback'))
  await ctxReplyWithAudio(ctx, new InputFile({ url: spotifyTrackInfo.data[0].previewURL }), {
    title: track,
    performer: artist,
    caption: getTrackpreviewText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name),
    reply_to_message_id: messageId,
    allow_sending_without_reply: true
  })
}
