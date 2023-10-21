import { type CallbackQueryContext, type Context } from 'grammy'
import { githubConfig, instagramConfig, melodyScoutConfig, spotifyConfig } from '../../../config'
import { ctxAnswerCallbackQuery, ctxEditMessageReplyMarkup, ctxReply, ctxTempReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { MsGithubApi } from '../../../api/msGithubApi/base'
import { zodAIImageMetadata } from '../../../types'
import { MsInstagramApi } from '../../../api/msInstagramApi/base'
import { composeStoryImage, createStoriesVideo } from '../../../functions/mediaEditors'
import { getTrackPreview } from '../../../functions/getTrackPreview'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { getPostimageText } from '../../textFabric/postimage'

const postedImages: string[] = []

export async function runPostimageCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const imageId = dataArray[1]
  if (imageId === undefined) {
    void ctxTempReply(ctx, 'Infelizmente ocorreu um erro ao tentar compartilhar essa imagem!', 15000)
  }
  if (postedImages.includes(imageId)) {
    void ctxTempReply(ctx, 'Opa! Parece que essa imagem que você me pediu para compartilhar já está sendo compartilhada!', 15000, {
      reply_to_message_id: messageId,
      allow_sending_without_reply: true
    })
    return
  }
  postedImages.push(imageId)
  const loadingReply = await ctxReply(ctx, undefined, 'Que legal! Vou compartilhar essa imagem nos stories do MelodyScout no Instagram!\nAssim que estiver pronto, eu te aviso!', {
    reply_to_message_id: messageId,
    allow_sending_without_reply: true
  })
  const getGithubImagePromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}.jpg`)
  const metadataVersion = zodAIImageMetadata.shape.version.value
  const getGithubMetadataPromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}-${metadataVersion}.json`)
  const [getGithubImage, getGithubMetadata] = await Promise.all([getGithubImagePromise, getGithubMetadataPromise])
  if (!getGithubImage.success) {
    void ctxTempReply(ctx, 'Não foi possível compartilhar a imagem! A imagem não foi encontrada no sistema!', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  if (!getGithubMetadata.success) {
    void ctxTempReply(ctx, 'Não foi possível compartilhar a imagem! A imagem não foi encontrada ou versão dela não é mais suportada!', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  const image = Buffer.from(getGithubImage.data.content, 'base64')
  const metadata = JSON.parse(Buffer.from(getGithubMetadata.data.content, 'base64').toString())
  const parsedMetadata = zodAIImageMetadata.safeParse(metadata)
  if (!parsedMetadata.success) {
    void ctxTempReply(ctx, 'Não foi possível compartilhar a imagem! As informações da imagem são invalidas!', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  const trackPreview = await getTrackPreview(parsedMetadata.data.trackName, parsedMetadata.data.artistName)
  if (!trackPreview.success) {
    void ctxTempReply(ctx, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao tentar buscar informações da música!', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  const trackPreviewData = await new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret).getTrackPreviewBuffer(trackPreview.previewUrl)
  if (!trackPreviewData.success) {
    void ctxTempReply(ctx, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao tentar buscar informações da música!', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  const storiesImageResponse = await composeStoryImage(image)
  if (!storiesImageResponse.success) {
    void ctxTempReply(ctx, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao tentar criar a imagem para o Instagram!', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  const storiesVideoResponse = await createStoriesVideo(storiesImageResponse.storiesImage, trackPreviewData.file.buffer, parsedMetadata.data)
  if (!storiesVideoResponse.success) {
    void ctxTempReply(ctx, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao tentar criar o vídeo para o Instagram!', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  const publishStoryResponse = await new MsInstagramApi(instagramConfig.username, instagramConfig.password).postStory({
    video: storiesVideoResponse.data.video,
    coverImage: storiesImageResponse.storiesImage
  })
  if (!publishStoryResponse.success) {
    postedImages.splice(postedImages.indexOf(imageId), 1)
    void ctxTempReply(ctx, 'Ocorreu um erro ao tentar compartilhar a imagem', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  const editMessageReplyMarkupResponse = await ctxEditMessageReplyMarkup(ctx, undefined, undefined)
  if (editMessageReplyMarkupResponse instanceof Error) {
    void ctxTempReply(ctx, 'Ocorreu um erro ao tentar compartilhar a imagem', 15000, {
      reply_to_message_id: loadingReply?.message_id,
      allow_sending_without_reply: true
    })
    return
  }
  await ctxReply(ctx, undefined, getPostimageText(ctxLang, publishStoryResponse.postUrl, String(ctx.from.id), ctx.from.first_name), {
    reply_to_message_id: loadingReply?.message_id ?? messageId,
    allow_sending_without_reply: true
  })
}
