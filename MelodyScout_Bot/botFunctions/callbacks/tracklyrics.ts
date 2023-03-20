import { CallbackQueryContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import config from '../../../config'
import { getCallbackKey } from '../../../function/callbackMaker'
import { getLyricsText } from '../../textFabric/lyrics'

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
    if (messageId === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const dataArray = ctx.callbackQuery.data.split(config.melodyScout.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const geniusSong = await this.msGeniusApi.getSong(track, artist)
    if (!geniusSong.success) {
      void this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível encontrar a letra dessa música na Genius.', { reply_to_message_id: messageId })
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.text('[💬] - Traduzir', getCallbackKey(['TTL', track, artist]))
    await this.ctxFunctions.reply(ctx, getLyricsText(track, artist, geniusSong.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`), { reply_to_message_id: messageId, reply_markup: inlineKeyboard, disable_web_page_preview: true })
  }
}
