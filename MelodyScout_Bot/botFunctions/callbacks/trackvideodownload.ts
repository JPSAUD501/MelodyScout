import { type CallbackQueryContext, type Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithVideo, ctxTempReply } from '../../../functions/grammyFunctions'
import { melodyScoutConfig, spotifyConfig } from '../../../config'

import { lang } from '../../../translations/base'
import { getTrackvideodownloadText } from '../../textFabric/trackvideodownload'
import { MsMusicApi } from '../../../api/msMusicApi/base'
// import axios from 'axios'

export async function runTrackVideoDownloadCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'loadingInformCallback', value: '⏳ - Carregando…' }))
  const messageReplyId = ctx.callbackQuery.message?.reply_to_message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage', value: 'Algo deu errado ao identificar a música ou o artista, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' }))
    return
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const trackInfo = await msMusicApi.getYoutubeTrackInfo(track, artist)
  if (!trackInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'youtubeTrackDataNotFoundedErrorMessage', value: 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' }))
    return
  }
  const loadingMessage = await ctxTempReply(ctx, lang(ctxLang, { key: 'downloadingTrackInformMessage', value: '⏳ - Fazendo download da música…' }), 10000, { reply_to_message_id: messageReplyId, allow_sending_without_reply: true, disable_notification: true })
  if (loadingMessage === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnSendLoadingMessageInformMessage', value: 'Algo deu errado ao enviar a mensagem de carregamento, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' }))
    return
  }
  const download = await msMusicApi.youtubeTrackVideoDownload(trackInfo.videoUrl)
  if (!download.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnDownloadTrackInformMessage', value: 'Algo deu errado ao baixar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' }))
    return
  }
  const inputFile = new InputFile(download.file.buffer, `${track}-MelodyScoutAi.mp4`)

  await ctxReplyWithVideo(ctx, inputFile, {
    caption: getTrackvideodownloadText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name),
    reply_to_message_id: messageReplyId,
    allow_sending_without_reply: true
  })
}
