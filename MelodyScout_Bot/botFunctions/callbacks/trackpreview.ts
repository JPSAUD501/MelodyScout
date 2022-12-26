import { CallbackQueryContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsSpotifyApi } from '../../../api/msSpotifyApi/base'

export class TrackpreviewCallback {
  private readonly ctxFunctions: CtxFunctions
  private readonly msSpotApi: MsSpotifyApi

  constructor (ctxFunctions: CtxFunctions, msSpotApi: MsSpotifyApi) {
    this.ctxFunctions = ctxFunctions
    this.msSpotApi = msSpotApi
  }

  // CallbackQuery: getTrackPreview:-:<trackName>:-:<artistName>
  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Mensagem não encontrada!')
    const dataArray = ctx.callbackQuery.data.split(':-:')
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Nome da música ou do artista não encontrado!')
    const spotifyTrackInfo = await this.msSpotApi.getTrackInfo(track, artist)
    if (!spotifyTrackInfo.success) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Ocorreu um erro ao tentar obter a URL de preview da música')
    await ctx.answerCallbackQuery('🎵 - Enviando preview da música...')
    await this.ctxFunctions.replyWithAudio(ctx, spotifyTrackInfo.previewUrl, {
      title: track,
      performer: artist,
      caption: `Preview de <b>${track}</b> por <b>${artist}</b>\n\nSolicitado por: <b><a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a></b>`,
      reply_to_message_id: messageId
    })
    await this.ctxFunctions.answerCallbackQuery(ctx)
  }
}
