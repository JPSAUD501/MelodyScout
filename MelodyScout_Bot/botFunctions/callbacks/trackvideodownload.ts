import { type CallbackQueryContext, type Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithVideo, ctxTempReply } from '../../../functions/grammyFunctions'
import { melodyScoutConfig, spotifyConfig } from '../../../config'

import { lang } from '../../../translations/base'
import { getTrackvideodownloadText } from '../../textFabric/trackvideodownload'
import { MsMusicApi } from '../../../api/msMusicApi/base'
// import axios from 'axios'

export async function runTrackVideoDownloadCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
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
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
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
  const download = await msMusicApi.youtubeTrackVideoDownload(trackInfo.videoUrl)
  if (!download.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnDownloadTrackInformMessage'))
    return
  }
  const inputFile = new InputFile(download.file.buffer, `${track}-MelodyScoutAi.mp4`)

  await ctxReplyWithVideo(ctx, inputFile, {
    caption: getTrackvideodownloadText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name),
    reply_to_message_id: messageReplyId,
    allow_sending_without_reply: true
  })
}
