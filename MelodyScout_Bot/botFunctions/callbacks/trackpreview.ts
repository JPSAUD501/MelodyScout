import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithAudio } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translation/base'

export async function runTrackpreviewCallback (msMusicApi: MsMusicApi, ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'dontWorkOnChannelsInformCallback'))
    return
  }
  const messageId = ctx.callbackQuery.message?.message_id
  if (messageId === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetMessageIdFromButtonInformMessage'))
    return
  }
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) return await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'lastfmTrackOrArtistDataNotFoundedErrorCallback'))
  const spotifyTrackInfo = await msMusicApi.getSpotifyTrackInfo(track, artist)
  if (!spotifyTrackInfo.success) return await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'))
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'sendingTrackPreviewInformCallback'))
  await ctxReplyWithAudio(ctx, new InputFile({ url: spotifyTrackInfo.data.previewURL }), {
    title: track,
    performer: artist,
    caption: lang(ctxLang, 'trackPreviewCaptionMessage', { track, artist, requesterId: ctx.from.first_name, requesterName: ctx.from.id }),
    reply_to_message_id: messageId
  })
}
