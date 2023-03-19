import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import config from '../../../config'
import { AdvConsole } from '../../../function/advancedConsole'
import { MsMusicApi } from '../../../api/msMusicApi/base'
// import axios from 'axios'

export class TrackDownloadCallback {
  advConsole: AdvConsole
  ctxFunctions: CtxFunctions
  msMusicApi: MsMusicApi

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msMusicApi: MsMusicApi) {
    this.advConsole = advConsole
    this.ctxFunctions = ctxFunctions
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Eu não funciono em canais!')
      return
    }
    if (ctx.chat?.type === 'private') {
      void this.ctxFunctions.reply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Eu não funciono em conversas privadas!')
      return
    }
    void this.ctxFunctions.answerCallbackQuery(ctx, '⏳ - Carregando...')
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const dataArray = ctx.callbackQuery.data.split(config.melodyScout.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const trackInfo = await this.msMusicApi.getYoutubeTrackInfo(track, artist)
    if (!trackInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const loadingMessage = await this.ctxFunctions.loadingReply(ctx, '⏳ - Fazendo download da música...', 5000, { reply_to_message_id: messageId, disable_notification: true })
    if (loadingMessage === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao enviar a mensagem de carregamento, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const alternativeDownload = await this.msMusicApi.youtubeTrackDownloadAudio(trackInfo.videoUrl)
    if (!alternativeDownload.success) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao baixar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const inputFile = new InputFile(alternativeDownload.audioBuffer)

    await this.ctxFunctions.replyWithAudio(ctx, inputFile, {
      title: track,
      performer: artist,
      caption: `<b>[🎵] Download de "${track}" por "${artist}"</b>\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`,
      reply_to_message_id: messageId
    })
  }
}
