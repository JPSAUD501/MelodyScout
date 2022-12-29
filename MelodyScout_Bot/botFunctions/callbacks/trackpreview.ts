import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import config from '../../../config'

export class TrackpreviewCallback {
  private readonly ctxFunctions: CtxFunctions
  private readonly msMusicApi: MsMusicApi

  constructor (ctxFunctions: CtxFunctions, msMusicApi: MsMusicApi) {
    this.ctxFunctions = ctxFunctions
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Mensagem não encontrada!')
    const dataArray = ctx.callbackQuery.data.split(config.melodyScout.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Nome da música ou do artista não encontrado!')
    const spotifyTrackInfo = await this.msMusicApi.getSpotifyTrackInfo(track, artist)
    if (!spotifyTrackInfo.success) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Ocorreu um erro ao tentar obter a URL de preview da música')
    await ctx.answerCallbackQuery('🎵 - Enviando preview da música...')
    await this.ctxFunctions.replyWithAudio(ctx, new InputFile({ url: spotifyTrackInfo.previewUrl }), {
      title: track,
      performer: artist,
      caption: `Preview de <b>${track}</b> por <b>${artist}</b>\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`,
      reply_to_message_id: messageId
    })
    await this.ctxFunctions.answerCallbackQuery(ctx)
  }
}
