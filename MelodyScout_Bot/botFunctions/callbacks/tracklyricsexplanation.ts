import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import config from '../../../config'
import { getTracklyricsexplanationText } from '../../textFabric/tracklyricsexplanation'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'
import { AdvConsole } from '../../../function/advancedConsole'
import { MsTextToSpeechApi } from '../../../api/msTextToSpeechApi/base'

export class TracklyricsexplanationCallback {
  private readonly advConsole: AdvConsole
  private readonly ctxFunctions: CtxFunctions
  private readonly msGeniusApi: MsGeniusApi
  private readonly msOpenAiApi: MsOpenAiApi
  private readonly msTextToSpeechApi: MsTextToSpeechApi

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msGeniusApi: MsGeniusApi, msOpenAiApi: MsOpenAiApi, msTextToSpeechApi: MsTextToSpeechApi) {
    this.advConsole = advConsole
    this.ctxFunctions = ctxFunctions
    this.msGeniusApi = msGeniusApi
    this.msOpenAiApi = msOpenAiApi
    this.msTextToSpeechApi = msTextToSpeechApi
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
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const dataArray = ctx.callbackQuery.data.split(config.melodyScout.divider)
    const track = dataArray[1]
    const artist = dataArray[2]
    if (track === undefined || artist === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const loadingMessage = await this.ctxFunctions.loadingReply(ctx, '⏳ - Gerando explicação da música com inteligência artificial, aguarde um momento...', 15000, { reply_to_message_id: messageId })
    if (loadingMessage === undefined) {
      void this.ctxFunctions.reply(ctx, 'Algo deu errado ao enviar a mensagem de carregamento, por favor tente novamente mais tarde ou entre em contato através do comando /contact')
      return
    }
    const geniusSong = await this.msGeniusApi.getSong(track, artist)
    if (!geniusSong.success) {
      void this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível encontrar a letra dessa música na Genius.', { reply_to_message_id: messageId })
      return
    }
    const lyricsExplanationRequest = this.msOpenAiApi.getLyricsExplanation(geniusSong.data.lyrics)
    const lyricsEmojisRequest = this.msOpenAiApi.getLyricsEmojis(geniusSong.data.lyrics)
    const [lyricsExplanation, lyricsEmojis] = await Promise.all([lyricsExplanationRequest, lyricsEmojisRequest])
    if (!lyricsExplanation.success) {
      void this.ctxFunctions.reply(ctx, 'Ocorreu um erro ao tentar gerar a explicação da letra dessa música, por favor tente novamente mais tarde.', { reply_to_message_id: messageId })
      return
    }
    if (!lyricsEmojis.success) {
      void this.ctxFunctions.reply(ctx, 'Ocorreu um erro ao tentar gerar os emojis da letra dessa música, por favor tente novamente mais tarde.', { reply_to_message_id: messageId })
      return
    }
    this.advConsole.log(`New track lyrics explanation generated for ${track} by ${artist} by user ${ctx.from.id}: ${lyricsExplanation.explanation} / ${lyricsEmojis.emojis}`)
    const TTSAudio = await this.msTextToSpeechApi.getTTS(`Explicação da música "${track}" de "${artist}" gerada pela inteligência artificial do MelodyScout. ${lyricsExplanation.explanation}`)
    if (!TTSAudio.success) {
      void this.ctxFunctions.reply(ctx, 'Ocorreu um erro ao tentar gerar o áudio da explicação da letra dessa música, por favor tente novamente mais tarde.', { reply_to_message_id: messageId })
      return
    }
    const TTSAudioInputFile = new InputFile(TTSAudio.data.audio, `${track}-MelodyScoutAi.mp3`)
    await this.ctxFunctions.replyWithVoice(ctx, TTSAudioInputFile, {
      reply_to_message_id: messageId,
      caption: getTracklyricsexplanationText(track, artist, lyricsExplanation.explanation, lyricsEmojis.emojis, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`)
    })
  }
}
