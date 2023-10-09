import { type CallbackQueryContext, type Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxEditMessage, ctxReply, ctxReplyWithVoice, ctxTempReply } from '../../../function/grammyFunctions'
import { getTracklyricsexplanationText } from '../../textFabric/tracklyricsexplanation'
import { geniusConfig, githubConfig, melodyScoutConfig, openaiConfig, replicateConfig } from '../../../config'
import { advError, advLog } from '../../../function/advancedConsole'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'
import { MsTextToSpeechApi } from '../../../api/msTextToSpeechApi/base'
import { lang } from '../../../translations/base'
import { MsReplicateApi } from '../../../api/msReplicateApi/base'
import sharp from 'sharp'
import fs from 'fs'
import { MsGithubApi } from '../../../api/msGithubApi/base'
import { randomUUID } from 'crypto'
import path from 'path'

export async function composeImage (ctxLang: string | undefined, image: Buffer, trackName: string, artistName: string): Promise<{
  success: true
  image: Buffer
} | {
  success: false
  error: string
}> {
  const fontFilePath = path.join(__dirname, '../../../public/fonts/Poppins/Poppins-Regular.ttf')
  const imageFramePath = path.join(__dirname, '../../../public/v2/imageFrame.png')
  const textOverlay = await sharp({
    text: {
      text: lang(ctxLang, 'composeImageTitle', { trackName, artistName }),
      fontfile: fontFilePath,
      font: 'Poppins Medium',
      height: 27,
      width: 906,
      rgba: true,
      wrap: 'none'
    }
  }).resize({
    height: 27,
    width: 906,
    fit: 'contain',
    background: {
      r: 0,
      g: 0,
      b: 0,
      alpha: 0
    }
  }).webp().toBuffer().catch((error) => {
    return new Error(error)
  })
  if (textOverlay instanceof Error) {
    return {
      success: false,
      error: `Error on creating text overlay: ${textOverlay.message}`
    }
  }
  const finalImage = await sharp(image)
    .resize(1000, 1000)
    .composite([
      { input: fs.readFileSync(imageFramePath) },
      {
        input: textOverlay,
        top: 45,
        left: (1000 - 906) / 2
      }
    ])
    .jpeg({
      mozjpeg: true
    })
    .toBuffer()
    .catch((error) => {
      return new Error(error)
    })
  if (finalImage instanceof Error) {
    return {
      success: false,
      error: `Error on creating final image: ${finalImage.message}`
    }
  }
  return {
    success: true,
    image: finalImage
  }
}

async function getAiImageByLyrics (ctxLang: string | undefined, lyrics: string, trackName: string, artistName: string): Promise<{
  success: true
  imageUrl: string
} | {
  success: false
  error: string
}> {
  const msOpenAiApi = new MsOpenAiApi(openaiConfig.apiKey)
  const lyricsImageDescription = await msOpenAiApi.getLyricsImageDescription(lyrics)
  if (!lyricsImageDescription.success) {
    return {
      success: false,
      error: `Error on getting image description: ${lyricsImageDescription.error}`
    }
  }
  const msReplicateApi = new MsReplicateApi(replicateConfig.token)
  const imageByDescription = await msReplicateApi.getSdxlImage(lyricsImageDescription.description)
  if (!imageByDescription.success) {
    return {
      success: false,
      error: `Error on getting image by description: ${imageByDescription.error}`
    }
  }
  const finalImage = await composeImage(ctxLang, imageByDescription.image, trackName, artistName)
  if (!finalImage.success) {
    advError(`Error on composing image: ${finalImage.error}`)
    return {
      success: true,
      imageUrl: imageByDescription.imageUrl
    }
  }
  const githubApi = new MsGithubApi(githubConfig.token)
  const uploadToGithub = await githubApi.files.putFile(`${randomUUID()}.jpg`, finalImage.image.toString('base64'))
  if (!uploadToGithub.success) {
    advError(`Error on uploading image to github: ${uploadToGithub.errorData.message}`)
    return {
      success: true,
      imageUrl: imageByDescription.imageUrl
    }
  }
  advLog(`New image generated for ${trackName} by ${artistName}: ${uploadToGithub.data.content.download_url}`)
  return {
    success: true,
    imageUrl: uploadToGithub.data.content.download_url
  }
}

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
  aiImageStatus.imageUrl = imageByLyrics.imageUrl
  await ctxEditMessage(ctx, { chatId: commandResponse.chat.id, messageId: commandResponse.message_id }, getTracklyricsexplanationText(ctxLang, track, artist, lyricsExplanation.explanation, lyricsEmojis.success ? lyricsEmojis.emojis : undefined, `<a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>`, aiImageStatus))
}
