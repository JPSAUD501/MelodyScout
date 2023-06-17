import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithAudio } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { melodyScoutConfig } from '../../../config'

export class TrackpreviewCallback {
  private readonly msMusicApi: MsMusicApi

  constructor (msMusicApi: MsMusicApi) {
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      void ctxAnswerCallbackQuery(ctx, '⚠ - Eu não funciono em canais!')
      return
    }
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) {
      void ctxReply(ctx, 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) return await ctxAnswerCallbackQuery(ctx, '⚠ - Nome da música ou do artista não encontrado!')
    const spotifyTrackInfo = await this.msMusicApi.getSpotifyTrackInfo(track, artist)
    if (!spotifyTrackInfo.success) return await ctxAnswerCallbackQuery(ctx, '⚠ - Ocorreu um erro ao tentar obter a URL de preview da música')
    void ctx.answerCallbackQuery('🎵 - Enviando preview da música...')
    await ctxReplyWithAudio(ctx, new InputFile({ url: spotifyTrackInfo.data.previewURL }), {
      title: track,
      performer: artist,
      caption: `<b>[🎵] Preview de "${track}" por "${artist}"</b>\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`,
      reply_to_message_id: messageId
    })
  }
}
