import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithVideo, ctxTempReply } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { melodyScoutConfig } from '../../../config'
// import axios from 'axios'

export class TrackVideoDownloadCallback {
  msMusicApi: MsMusicApi

  constructor (msMusicApi: MsMusicApi) {
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      void ctxAnswerCallbackQuery(ctx, '⚠ - Eu não funciono em canais!')
      return
    }
    void ctxAnswerCallbackQuery(ctx, '⏳ - Carregando...')
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) {
      void ctxReply(ctx, 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const messageReplyId = ctx.callbackQuery.message?.reply_to_message?.message_id
    if (messageReplyId === undefined) {
      void ctxReply(ctx, 'Algo deu errado na mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) {
      void ctxReply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const trackInfo = await this.msMusicApi.getYoutubeTrackInfo(track, artist)
    if (!trackInfo.success) {
      void ctxReply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const loadingMessage = await ctxTempReply(ctx, '⏳ - Fazendo download da música...', 10000, { reply_to_message_id: messageReplyId, disable_notification: true })
    if (loadingMessage === undefined) {
      void ctxReply(ctx, 'Algo deu errado ao enviar a mensagem de carregamento, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const download = await this.msMusicApi.youtubeTrackDownload(trackInfo.videoUrl)
    if (!download.success) {
      void ctxReply(ctx, 'Algo deu errado ao baixar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const inputFile = new InputFile(download.file.buffer, `${track}-MelodyScoutAi.mp4`)

    await ctxReplyWithVideo(ctx, inputFile, {
      caption: `<b>[🎬] Download do vídeo de "${track}" por "${artist}"</b>\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`,
      reply_to_message_id: messageReplyId
    })
  }
}
