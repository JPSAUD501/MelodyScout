import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithAudio, ctxTempReply } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getTrackaudiodownloadText } from '../../textFabric/trackaudiodownload'

export async function runTrackAudioDownloadCallback (msMusicApi: MsMusicApi, ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'dontWorkOnChannelsInformCallback'))
    return
  }
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageId = ctx.callbackQuery.message?.message_id
  if (messageId === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetMessageIdFromButtonInformMessage'))
    return
  }
  const messageReplyId = ctx.callbackQuery.message?.reply_to_message?.message_id
  if (messageReplyId === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetMessageIdFromOriginalMessageOfButtonInformMessage'))
    return
  }
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage'))
    return
  }
  const trackInfo = await msMusicApi.getYoutubeTrackInfo(track, artist)
  if (!trackInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'youtubeTrackDataNotFoundedErrorMessage'))
    return
  }
  const loadingMessage = await ctxTempReply(ctx, lang(ctxLang, 'downloadingTrackInformMessage'), 10000, { reply_to_message_id: messageReplyId, disable_notification: true })
  if (loadingMessage === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'errorOnSendLoadingMessageInformMessage'))
    return
  }
  const download = await msMusicApi.youtubeTrackDownload(trackInfo.videoUrl)
  if (!download.success) {
    void ctxReply(ctx, lang(ctxLang, 'errorOnDownloadTrackInformMessage'))
    return
  }
  const inputFile = new InputFile(download.file.buffer, `${track}-MelodyScout.mp4`)

  await ctxReplyWithAudio(ctx, inputFile, {
    title: track,
    performer: artist,
    caption: getTrackaudiodownloadText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name),
    reply_to_message_id: messageReplyId
  })
}
