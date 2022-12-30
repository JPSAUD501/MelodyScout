import { CallbackQueryContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { getLyricsLiteText } from '../../function/textFabric'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import config from '../../../config'
import { getCallbackKey } from '../../../function/callbackMaker'

export class TracklyricsCallback {
  private readonly ctxFunctions: CtxFunctions
  private readonly msGeniusApi: MsGeniusApi

  constructor (ctxFunctions: CtxFunctions, msGeniusApi: MsGeniusApi) {
    this.ctxFunctions = ctxFunctions
    this.msGeniusApi = msGeniusApi
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
    if (messageId === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Mensagem não encontrada!')
    const dataArray = ctx.callbackQuery.data.split(config.melodyScout.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Nome da música ou do artista não encontrado!')
    const trackLyrics = await this.msGeniusApi.getLyrics(track, artist)
    if (trackLyrics === null) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar a letra dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao resgatar a letra da música!')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.text('Traduzir', getCallbackKey(['TTL', track, artist]))
    await this.ctxFunctions.reply(ctx, getLyricsLiteText(track, artist, trackLyrics, false, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`), { reply_to_message_id: messageId, reply_markup: inlineKeyboard })
  }
}