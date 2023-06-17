import { CallbackQueryContext, Context } from 'grammy'
import { ctxAnswerCallbackQuery, ctxEditMessage, ctxReply } from '../../../function/grammyFunctions'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { geniusConfig, melodyScoutConfig } from '../../../config'
import { translate } from '@vitalets/google-translate-api'
import { getLyricsText } from '../../textFabric/lyrics'

export async function runTranslatedtracklyricsCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    void ctxAnswerCallbackQuery(ctx, '⚠ - Eu não funciono em canais!')
    return
  }
  void ctxAnswerCallbackQuery(ctx, '⏳ - Carregando...')
  const messageId = ctx.callbackQuery.message?.message_id
  if (messageId === undefined) return await ctxAnswerCallbackQuery(ctx, '⚠ - Mensagem não encontrada!')
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) return await ctxAnswerCallbackQuery(ctx, '⚠ - Nome da música ou do artista não encontrado!')
  const msGeniusApi = new MsGeniusApi(geniusConfig.accessToken)
  const geniusSong = await msGeniusApi.getSong(track, artist)
  if (!geniusSong.success) {
    void ctxReply(ctx, 'Não foi possível resgatar a letra dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  console.log('Translating lyrics...')
  const translatedTrackLyrics = await translate(geniusSong.data.lyrics, { to: 'pt-BR' })
  console.log('Lyrics translated!')
  if (translatedTrackLyrics.text.length <= 0) {
    void ctxReply(ctx, 'Não foi possível traduzir a letra dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  await ctxEditMessage(ctx, getLyricsText(track, artist, geniusSong.data, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, translatedTrackLyrics.text), { disable_web_page_preview: true })
}
