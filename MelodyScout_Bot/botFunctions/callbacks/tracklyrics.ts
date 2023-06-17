import { CallbackQueryContext, Context, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../function/grammyFunctions'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { getCallbackKey } from '../../../function/callbackMaker'
import { getLyricsText } from '../../textFabric/lyrics'
import { melodyScoutConfig } from '../../../config'

export class TracklyricsCallback {
  private readonly msGeniusApi: MsGeniusApi

  constructor (msGeniusApi: MsGeniusApi) {
    this.msGeniusApi = msGeniusApi
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
    const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) {
      void ctxReply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
      return
    }
    const geniusSong = await this.msGeniusApi.getSong(track, artist)
    if (!geniusSong.success) {
      void ctxReply(ctx, 'Infelizmente não foi possível encontrar a letra dessa música na Genius.', { reply_to_message_id: messageId })
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.text('[💬] - Traduzir', getCallbackKey(['TTL', track, artist]))
    await ctxReply(ctx, getLyricsText(track, artist, geniusSong.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`), { reply_to_message_id: messageId, reply_markup: inlineKeyboard, disable_web_page_preview: true })
  }
}
