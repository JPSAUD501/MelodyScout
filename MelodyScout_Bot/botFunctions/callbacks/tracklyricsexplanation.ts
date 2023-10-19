import { type CallbackQueryContext, type Context, InputFile, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxEditMessage, ctxReply, ctxReplyWithVoice, ctxTempReply } from '../../../functions/grammyFunctions'
import { getTracklyricsexplanationText } from '../../textFabric/tracklyricsexplanation'
import { geniusConfig, melodyScoutConfig, openaiConfig } from '../../../config'
import { advLog } from '../../../functions/advancedConsole'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'
import { MsTextToSpeechApi } from '../../../api/msTextToSpeechApi/base'
import { lang } from '../../../translations/base'
import { getCallbackKey } from '../../../functions/callbackMaker'
import { getAiImageByLyrics } from '../../../functions/trackAiFunctions'

export async function runTracklyricsexplanationCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'lastfmTrackDataNotFoundedError'))
    return
  }
  const loadingMessage = await ctxTempReply(ctx, lang(ctxLang, 'creatingLyricsExplanationWithAiInformMessage'), 15000, { reply_to_message_id: messageId, allow_sending_without_reply: true, disable_notification: true })
  if (loadingMessage === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnSendLoadingMessageInformMessage'))
    return
  }
  const msGeniusApi = new MsGeniusApi(geniusConfig.accessToken)
  const geniusSong = await msGeniusApi.getSong(track, artist)
  if (!geniusSong.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'geniusTrackLyricsNotFoundedError'), { reply_to_message_id: messageId, allow_sending_without_reply: true })
    return
  }
  const imageByLyricsRequest = getAiImageByLyrics(ctxLang, geniusSong.data.lyrics, track, artist)
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const lyricsExplanationRequest = msOpenAiApi.getLyricsExplanation(ctxLang, geniusSong.data.lyrics)
  const lyricsEmojisRequest = msOpenAiApi.getLyricsEmojis(geniusSong.data.lyrics)
  const [lyricsExplanation, lyricsEmojis] = await Promise.all([lyricsExplanationRequest, lyricsEmojisRequest])
  if (!lyricsExplanation.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnCreatingLyricsExplanationInformMessage'), { reply_to_message_id: messageId, allow_sending_without_reply: true })
    return
  }
  advLog(`New track lyrics explanation generated for ${track} by ${artist} by user ${ctx.from.id}: ${lyricsExplanation.explanation} / ${lyricsEmojis.success ? lyricsEmojis.emojis : 'No emojis'}`)
  const msTextToSpeechApi = new MsTextToSpeechApi()
  const TTSAudioRequest = msTextToSpeechApi.getTTS(ctxLang, lang(ctxLang, 'trackLyricsExplanationTTSHeader', { track, artist }), `${lyricsExplanation.explanation}`)
  const TTSAudio = await TTSAudioRequest
  if (!TTSAudio.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnCreatingLyricsExplanationTTSInformMessage'), { reply_to_message_id: messageId, allow_sending_without_reply: true })
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
  const commandResponse = await ctxReply(ctx, undefined, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus), {
    reply_to_message_id: messageId,
    allow_sending_without_reply: true
  })
  if (commandResponse === undefined) {
    return
  }
  void ctxReplyWithVoice(ctx, TTSAudioInputFile, {
    reply_to_message_id: commandResponse.message_id,
    allow_sending_without_reply: true,
    disable_notification: true
  })
  const imageByLyrics = await imageByLyricsRequest
  if (!imageByLyrics.success) {
    aiImageStatus.status = 'error'
    await ctxEditMessage(ctx, { chatId: commandResponse.chat.id, messageId: commandResponse.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus))
    return
  }
  aiImageStatus.status = 'success'
  aiImageStatus.imageUrl = imageByLyrics.result.imageUrl
  const editedMessage = await ctxEditMessage(ctx, { chatId: commandResponse.chat.id, messageId: commandResponse.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus))
  if (editedMessage === undefined) return
  if (imageByLyrics.result.withLayout) {
    const uploadedMetadata = await imageByLyrics.result.uploadMetadataPromise
    if (uploadedMetadata.success) {
      const inlineKeyboard = new InlineKeyboard()
      inlineKeyboard.text('[📸] - Postar no insta do MS!', getCallbackKey(['PI', imageByLyrics.result.imageId]))
      await ctxEditMessage(ctx, { chatId: editedMessage.chat.id, messageId: editedMessage.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus), {
        reply_markup: inlineKeyboard
      })
    }
  }
}
