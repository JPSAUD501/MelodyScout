import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithVoice, ctxTempReply } from '../../../function/grammyFunctions'
import { getTracklyricsexplanationText } from '../../textFabric/tracklyricsexplanation'
import { geniusConfig, melodyScoutConfig, openaiConfig } from '../../../config'
import { advLog } from '../../../function/advancedConsole'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'
import { MsTextToSpeechApi } from '../../../api/msTextToSpeechApi/base'

export async function runTracklyricsexplanationCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
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
  const loadingMessage = await ctxTempReply(ctx, '⏳ - Gerando explicação da música com inteligência artificial, aguarde um momento...', 15000, { reply_to_message_id: messageId, disable_notification: true })
  if (loadingMessage === undefined) {
    void ctxReply(ctx, 'Algo deu errado ao enviar a mensagem de carregamento, por favor tente novamente mais tarde ou entre em contato através do comando /contact.')
    return
  }
  const msGeniusApi = new MsGeniusApi(geniusConfig.accessToken)
  const geniusSong = await msGeniusApi.getSong(track, artist)
  if (!geniusSong.success) {
    void ctxReply(ctx, 'Infelizmente não foi possível encontrar a letra dessa música na Genius.', { reply_to_message_id: messageId })
    return
  }
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const lyricsExplanationRequest = msOpenAiApi.getLyricsExplanation(geniusSong.data.lyrics)
  const lyricsEmojisRequest = msOpenAiApi.getLyricsEmojis(geniusSong.data.lyrics)
  const [lyricsExplanation, lyricsEmojis] = await Promise.all([lyricsExplanationRequest, lyricsEmojisRequest])
  if (!lyricsExplanation.success) {
    void ctxReply(ctx, 'Ocorreu um erro ao tentar gerar a explicação da letra dessa música, por favor tente novamente mais tarde.', { reply_to_message_id: messageId })
    return
  }
  advLog(`New track lyrics explanation generated for ${track} by ${artist} by user ${ctx.from.id}: ${lyricsExplanation.explanation} / ${lyricsEmojis.success ? lyricsEmojis.emojis : 'No emojis'}`)
  const msTextToSpeechApi = new MsTextToSpeechApi()
  const TTSAudio = await msTextToSpeechApi.getTTS(`Explicação da música "${track}" de "${artist}" pelo MelodyScout.`, `${lyricsExplanation.explanation}`)
  if (!TTSAudio.success) {
    void ctxReply(ctx, 'Ocorreu um erro ao tentar gerar o áudio da explicação da letra dessa música, por favor tente novamente mais tarde.', { reply_to_message_id: messageId })
    return
  }
  const TTSAudioInputFile = new InputFile(TTSAudio.data.audio, `${track}-MelodyScoutAi.mp3`)
  const commandResponse = await ctxReply(ctx, getTracklyricsexplanationText(track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`), {
    reply_to_message_id: messageId,
    disable_web_page_preview: true
  })
  if (commandResponse !== undefined) {
    await ctxReplyWithVoice(ctx, TTSAudioInputFile, {
      reply_to_message_id: commandResponse.message_id,
      disable_notification: true
    })
  }
}
