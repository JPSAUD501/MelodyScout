import { type CallbackQueryContext, type Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithAudio, ctxTempReply } from '../../../functions/grammyFunctions'
import { type MsMusicApi } from '../../../api/msMusicApi/base'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getTrackaudiodownloadText } from '../../textFabric/trackaudiodownload'

export async function runTrackAudioDownloadCallback (msMusicApi: MsMusicApi, ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageReplyId = ctx.callbackQuery.message?.reply_to_message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'))
    return
  }
  const trackInfo = await msMusicApi.getYoutubeTrackInfo(track, artist)
  if (!trackInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'youtubeTrackDataNotFoundedErrorMessage'))
    return
  }
  const loadingMessage = await ctxTempReply(ctx, lang(ctxLang, 'downloadingTrackInformMessage'), 10000, { reply_to_message_id: messageReplyId, allow_sending_without_reply: true, disable_notification: true })
  if (loadingMessage === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnSendLoadingMessageInformMessage'))
    return
  }
  const download = await msMusicApi.youtubeTrackAudioDownload(trackInfo.videoUrl)
  if (!download.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnDownloadTrackInformMessage'))
    return
  }
  const inputFile = new InputFile(download.file.buffer, `${track}-MelodyScout.mp4`)

  await ctxReplyWithAudio(ctx, inputFile, {
    title: track,
    performer: artist,
    caption: getTrackaudiodownloadText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name),
    reply_to_message_id: messageReplyId,
    allow_sending_without_reply: true
  })
}
