import { type CallbackQueryContext, type Context, InputFile, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxEditMessage, ctxReply, ctxReplyWithVoice, ctxTempReply } from '../../../functions/grammyFunctions'
import { getTracklyricsexplanationText } from '../../textFabric/tracklyricsexplanation'
import { geniusConfig, melodyScoutConfig, openaiConfig } from '../../../config'
import { advLog } from '../../../functions/advancedConsole'
import { MsLyricsApi } from '../../../api/msLyricsApi/base'
import { MsTextToSpeechApi } from '../../../api/msTextToSpeechApi/base'
import { lang } from '../../../translations/base'
import { getCallbackKey } from '../../../functions/callbackMaker'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'
import { getAiImageByLyrics } from '../../../functions/trackAiFunctions'

export async function runTracklyricsexplanationCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'loadingInformCallback', value: '⏳ - Carregando…' }))
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  void ctxTempReply(ctx, lang(ctxLang, { key: 'creatingLyricsExplanationWithAiInformMessage', value: '⏳ - Gerando explicação da música com inteligência artificial, aguarde um momento…' }), 20000, {
    reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined,
    disable_notification: true
  })
  const msLyricsApi = new MsLyricsApi(geniusConfig.accessToken)
  const songLyricsData = await msLyricsApi.getLyrics(track, artist)
  if (!songLyricsData.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'trackLyricsNotFoundedError', value: 'Infelizmente não foi possível encontrar a letra dessa música em nenhuma de nossas fontes.' }), {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const openAiLyricsImageDescription = await msOpenAiApi.getLyricsImageDescription(track, artist, songLyricsData.data.lyrics)
  if (!openAiLyricsImageDescription.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnCreatingLyricsExplanationInformMessage', value: 'Ocorreu um erro ao tentar gerar a explicação da letra dessa música, por favor tente novamente mais tarde.' }), {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const lyricsExplanation = await msOpenAiApi.getLyricsExplanation(ctxLang, track, artist, songLyricsData.data.lyrics, openAiLyricsImageDescription.description)
  if (!lyricsExplanation.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnCreatingLyricsExplanationInformMessage', value: 'Ocorreu um erro ao tentar gerar a explicação da letra dessa música, por favor tente novamente mais tarde.' }), {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  advLog(`New track lyrics explanation generated for ${track} by ${artist} by user ${ctx.from.id}: ${lyricsExplanation.explanation}`)
  const imageByLyricsRequest = getAiImageByLyrics(ctxLang, songLyricsData.data.lyrics, openAiLyricsImageDescription.description, track, artist)
  const msTextToSpeechApi = new MsTextToSpeechApi()
  const TTSAudioRequest = msTextToSpeechApi.getTTS(ctxLang, lang(ctxLang, { key: 'trackLyricsExplanationTTSHeader', value: 'Explicação da música "{{track}}" de "{{artist}}" pelo MelodyScout.' }, { track, artist }), `${lyricsExplanation.explanation}`)
  const TTSAudio = await TTSAudioRequest
  if (!TTSAudio.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnCreatingLyricsExplanationTTSInformMessage', value: 'Ocorreu um erro ao tentar gerar o áudio da explicação da letra dessa música, por favor tente novamente mais tarde.' }), {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const TTSAudioInputFile = new InputFile(TTSAudio.data.audio, `${track}-MelodyScoutAi.mp3`)
  const aiImageStatus: {
    status: 'loading' | 'success' | 'error'
    imageUrl: string
  } = {
    status: 'loading',
    imageUrl: ''
  }
  const commandResponse = await ctxReply(ctx, undefined, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus), {
    reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined,
    link_preview_options: {
      prefer_large_media: true,
      url: melodyScoutConfig.artificialIntelligenceImgUrl
    }
  })
  if (commandResponse === undefined) {
    return
  }
  void ctxReplyWithVoice(ctx, TTSAudioInputFile, {
    reply_parameters: {
      message_id: commandResponse.message_id,
      allow_sending_without_reply: true
    },
    disable_notification: true
  })
  const imageByLyrics = await imageByLyricsRequest
  if (!imageByLyrics.success) {
    aiImageStatus.status = 'error'
    await ctxEditMessage(ctx, { chatId: commandResponse.chat.id, messageId: commandResponse.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus), {
      link_preview_options: {
        prefer_large_media: true,
        url: aiImageStatus.imageUrl
      }
    })
    return
  }
  aiImageStatus.status = 'success'
  aiImageStatus.imageUrl = imageByLyrics.result.imageUrl
  switch (true) {
    case (imageByLyrics.result.withLayout): {
      const inlineKeyboard = new InlineKeyboard()
      inlineKeyboard.text('[📸] - Postar no insta do MS!', getCallbackKey(['PI', imageByLyrics.result.imageId]))
      await ctxEditMessage(ctx, { chatId: commandResponse.chat.id, messageId: commandResponse.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus), {
        reply_markup: inlineKeyboard,
        link_preview_options: {
          prefer_large_media: true,
          url: aiImageStatus.imageUrl
        }
      })
      break
    }
    default: {
      await ctxEditMessage(ctx, { chatId: commandResponse.chat.id, messageId: commandResponse.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus), {
        link_preview_options: {
          prefer_large_media: true,
          url: aiImageStatus.imageUrl
        }
      })
    }
  }
}
