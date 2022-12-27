import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'

export class TrackdownloadCallback {
  private readonly ctxFunctions: CtxFunctions
  private readonly msMusicApi: MsMusicApi

  constructor (ctxFunctions: CtxFunctions, msMusicApi: MsMusicApi) {
    this.ctxFunctions = ctxFunctions
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Mensagem não encontrada!')
    const dataArray = ctx.callbackQuery.data.split(':-:')
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Nome da música ou do artista não encontrado!')
    const youtubeTrackInfo = await this.msMusicApi.getYoutubeTrackInfo(track, artist)
    if (!youtubeTrackInfo.success) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Ocorreu um erro ao tentar obter a URL de download da música')
    await ctx.answerCallbackQuery('🎵 - Enviando preview da música...')
    this.ctxFunctions.replyWithAudio(ctx, new InputFile({ url: youtubeTrackInfo.audioUrl }), {
      title: track,
      performer: artist,
      caption: `<b>${track}</b> de <b>${artist}</b>\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`,
      reply_to_message_id: messageId
    }).catch(async (err) => {
      await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Ocorreu um erro ao tentar enviar a música')
      console.log(err)
    })
    await this.ctxFunctions.answerCallbackQuery(ctx)
  }
}
