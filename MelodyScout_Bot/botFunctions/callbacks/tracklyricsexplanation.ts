import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithVoice, ctxTempReply } from '../../../function/grammyFunctions'
import { getTracklyricsexplanationText } from '../../textFabric/tracklyricsexplanation'
import { geniusConfig, melodyScoutConfig, openaiConfig } from '../../../config'
import { advLog } from '../../../function/advancedConsole'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'
import { MsTextToSpeechApi } from '../../../api/msTextToSpeechApi/base'
import { lang } from '../../../translations/base'

export async function runTracklyricsexplanationCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'dontWorkOnChannelsInformCallback'))
    return
  }
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageId = ctx.callbackQuery.message?.message_id
  if (messageId === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetMessageIdFromButtonInformMessage'))
    return
  }
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmTrackDataNotFoundedError'))
    return
  }
  const loadingMessage = await ctxTempReply(ctx, lang(ctxLang, 'creatingLyricsExplanationWithAiInformMessage'), 15000, { reply_to_message_id: messageId, disable_notification: true })
  if (loadingMessage === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'errorOnSendLoadingMessageInformMessage'))
    return
  }
  const msGeniusApi = new MsGeniusApi(geniusConfig.accessToken)
  const geniusSong = await msGeniusApi.getSong(track, artist)
  if (!geniusSong.success) {
    void ctxReply(ctx, lang(ctxLang, 'geniusSongLyricsNotFoundedError'), { reply_to_message_id: messageId })
    return
  }
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const lyricsExplanationRequest = msOpenAiApi.getLyricsExplanation(geniusSong.data.lyrics)
  const lyricsEmojisRequest = msOpenAiApi.getLyricsEmojis(geniusSong.data.lyrics)
  const [lyricsExplanation, lyricsEmojis] = await Promise.all([lyricsExplanationRequest, lyricsEmojisRequest])
  if (!lyricsExplanation.success) {
    void ctxReply(ctx, lang(ctxLang, 'errorOnCreatingLyricsExplanationInformMessage'), { reply_to_message_id: messageId })
    return
  }
  advLog(`New track lyrics explanation generated for ${track} by ${artist} by user ${ctx.from.id}: ${lyricsExplanation.explanation} / ${lyricsEmojis.success ? lyricsEmojis.emojis : 'No emojis'}`)
  const msTextToSpeechApi = new MsTextToSpeechApi()
  const TTSAudio = await msTextToSpeechApi.getTTS(lang(ctxLang, 'trackLyricsExplanationTTSHeader', { track, artist }), `${lyricsExplanation.explanation}`) // TODO PASS LANG TO TTS
  if (!TTSAudio.success) {
    void ctxReply(ctx, lang(ctxLang, 'errorOnCreatingLyricsExplanationTTSInformMessage'), { reply_to_message_id: messageId })
    return
  }
  const TTSAudioInputFile = new InputFile(TTSAudio.data.audio, `${track}-MelodyScoutAi.mp3`)
  const commandResponse = await ctxReply(ctx, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`), {
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
