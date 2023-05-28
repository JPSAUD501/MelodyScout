import { CallbackQueryContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { melodyScoutConfig } from '../../../config'
import { translate } from '@vitalets/google-translate-api'
import { getLyricsText } from '../../textFabric/lyrics'

export class TranslatedtracklyricsCallback {
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
    void this.ctxFunctions.answerCallbackQuery(ctx, '⏳ - Carregando...')
    const messageId = ctx.callbackQuery.message?.message_id
    if (messageId === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Mensagem não encontrada!')
    const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) return await this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Nome da música ou do artista não encontrado!')
    const geniusSong = await this.msGeniusApi.getSong(track, artist)
    if (!geniusSong.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar a letra dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    console.log('Translating lyrics...')
    const translatedTrackLyrics = await translate(geniusSong.data.lyrics, { to: 'pt-BR' })
    console.log('Lyrics translated!')
    if (translatedTrackLyrics.text.length <= 0) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível traduzir a letra dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    await this.ctxFunctions.editMessage(ctx, getLyricsText(track, artist, geniusSong.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, translatedTrackLyrics.text), { disable_web_page_preview: true })
  }
}
