import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxEditMessage, ctxReply, ctxReplyWithVoice, ctxTempReply } from '../../../function/grammyFunctions'
import { getTracklyricsexplanationText } from '../../textFabric/tracklyricsexplanation'
import { clickupConfig, geniusConfig, melodyScoutConfig, openaiConfig, replicateConfig } from '../../../config'
import { advLog } from '../../../function/advancedConsole'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'
import { MsTextToSpeechApi } from '../../../api/msTextToSpeechApi/base'
import { lang } from '../../../translations/base'
import { MsReplicateApi } from '../../../api/msReplicateApi/base'
import { ClickUpApi } from '../../../api/ClickUpApi/base'
import sharp from 'sharp'
import fs from 'fs'

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
  const loadingMessage = await ctxTempReply(ctx, lang(ctxLang, 'creatingLyricsExplanationWithAiInformMessage'), 20000, { reply_to_message_id: messageId, allow_sending_without_reply: true, disable_notification: true })
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
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const lyricsExplanationRequest = msOpenAiApi.getLyricsExplanation(ctxLang, geniusSong.data.lyrics)
  const lyricsEmojisRequest = msOpenAiApi.getLyricsEmojis(geniusSong.data.lyrics)
  const lyricsImageDescriptionRequest = msOpenAiApi.getLyricsImageDescription(geniusSong.data.lyrics)
  const [lyricsExplanation, lyricsEmojis, lyricsImageDescription] = await Promise.all([lyricsExplanationRequest, lyricsEmojisRequest, lyricsImageDescriptionRequest])
  if (!lyricsExplanation.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnCreatingLyricsExplanationInformMessage'), { reply_to_message_id: messageId, allow_sending_without_reply: true })
    return
  }
  advLog(`New track lyrics explanation generated for ${track} by ${artist} by user ${ctx.from.id}: ${lyricsExplanation.explanation} / ${lyricsEmojis.success ? lyricsEmojis.emojis : 'No emojis'}`)
  if (!lyricsImageDescription.success) {
    void ctxReply(ctx, undefined, 'Error on creating image description', { reply_to_message_id: messageId, allow_sending_without_reply: true })
    return
  }
  const msTextToSpeechApi = new MsTextToSpeechApi()
  const TTSAudioRequest = msTextToSpeechApi.getTTS(ctxLang, lang(ctxLang, 'trackLyricsExplanationTTSHeader', { track, artist }), `${lyricsExplanation.explanation}`)
  const msReplicateApi = new MsReplicateApi(replicateConfig.token)
  const imageByDescriptionRequest = msReplicateApi.getSdxlImage(lyricsImageDescription.description)
  const TTSAudio = await TTSAudioRequest
  if (!TTSAudio.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorOnCreatingLyricsExplanationTTSInformMessage'), { reply_to_message_id: messageId, allow_sending_without_reply: true })
    return
  }
  const TTSAudioInputFile = new InputFile(TTSAudio.data.audio, `${track}-MelodyScoutAi.mp3`)
  const commandResponse = await ctxReply(ctx, undefined, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, ''), {
    reply_to_message_id: messageId,
    allow_sending_without_reply: true
  })
  if (commandResponse === undefined) {
    return
  }
  void imageByDescriptionRequest.then(async (imageByDescription) => {
    if (!imageByDescription.success) {
      return
    }
    const finalImage = await sharp(imageByDescription.image)
      .resize(1000, 1000)
      .composite([{
        input: fs.readFileSync('./public/v2/imageFrame.png')
      }]).png().toBuffer()
    const clickUpApi = new ClickUpApi(clickupConfig.token)
    const uploadToClickUp = await clickUpApi.attachments.createTaskAttachment(clickupConfig.defaultUploadTaskId, finalImage, `${track}-${artist}-MelodyScoutAi.png`)
    if (!uploadToClickUp.success) {
      void ctxReply(ctx, undefined, 'Error on uploading image to ClickUp', { reply_to_message_id: messageId, allow_sending_without_reply: true })
      return
    }
    await ctxEditMessage(ctx, { chatId: commandResponse.chat.id, messageId: commandResponse.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, uploadToClickUp.data.url))
  })
  await ctxReplyWithVoice(ctx, TTSAudioInputFile, {
    reply_to_message_id: commandResponse.message_id,
    allow_sending_without_reply: true,
    disable_notification: true
  })
}
