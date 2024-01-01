import { type CallbackQueryContext, type Context } from 'grammy'
import { githubConfig, melodyScoutConfig, spotifyConfig } from '../../../config'
import { ctxAnswerCallbackQuery, ctxEditMessageReplyMarkup, ctxReply, ctxTempReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { MsGithubApi } from '../../../api/msGithubApi/base'
import { zodAIImageMetadata } from '../../../types'
import { MsInstagramApi } from '../../../api/msInstagramApi/base'
import { composeStoryImage, createStoriesVideo } from '../../../functions/mediaEditors'
import { getTrackPreview } from '../../../functions/getTrackPreview'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { getPostimageText } from '../../textFabric/postimage'

const postedImages: Record<string, boolean> = {}

export async function runPostimageCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'loadingInformCallback', value: '⏳ - Carregando…' }))
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const imageId = dataArray[1]
  if (imageId === undefined) {
    void ctxTempReply(ctx, 'Infelizmente ocorreu um erro ao tentar compartilhar essa imagem!', 15000)
  }
  if (postedImages[imageId]) {
    void ctxTempReply(ctx, 'Opa! Parece que essa imagem que você me pediu para compartilhar já está sendo compartilhada!', 15000, {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  postedImages[imageId] = true
  const loadingReply = await ctxReply(ctx, undefined, 'Que legal! Vou compartilhar essa imagem nos stories do MelodyScout no Instagram!\nAssim que estiver pronto, eu te aviso!', {
    reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
  })
  const getGithubImagePromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}.jpg`)
  const metadataVersion = zodAIImageMetadata.shape.version.value
  const getGithubMetadataPromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}-${metadataVersion}.json`)
  const [getGithubImage, getGithubMetadata] = await Promise.all([getGithubImagePromise, getGithubMetadataPromise])
  if (!getGithubImage.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! A imagem não foi encontrada no sistema!', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  if (!getGithubMetadata.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! A imagem não foi encontrada ou versão dela não é mais suportada!', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const image = Buffer.from(getGithubImage.data.content, 'base64')
  const metadata = JSON.parse(Buffer.from(getGithubMetadata.data.content, 'base64').toString())
  const parsedMetadata = zodAIImageMetadata.safeParse(metadata)
  if (!parsedMetadata.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! As informações da imagem são invalidas!', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const trackPreview = await getTrackPreview(parsedMetadata.data.trackName, parsedMetadata.data.artistName, undefined)
  if (!trackPreview.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao tentar buscar informações da música!', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const trackPreviewData = await new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret).getTrackPreviewBuffer(trackPreview.previewUrl)
  if (!trackPreviewData.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao recuperar o preview da música!', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const storiesImageResponse = await composeStoryImage(image)
  if (!storiesImageResponse.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao tentar criar a imagem para o Instagram!', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const storiesVideoResponse = await createStoriesVideo(storiesImageResponse.storiesImage, trackPreviewData.file.buffer, parsedMetadata.data)
  if (!storiesVideoResponse.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! Ocorreu um erro ao tentar criar o vídeo para o Instagram!', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const publishStoryResponse = await new MsInstagramApi().postStory({
    video: storiesVideoResponse.data.video,
    coverImage: storiesImageResponse.storiesImage
  })
  if (!publishStoryResponse.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Ocorreu um erro ao tentar compartilhar a imagem', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const editMessageReplyMarkupResponse = await ctxEditMessageReplyMarkup(ctx, undefined, undefined)
  if (editMessageReplyMarkupResponse instanceof Error) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Ocorreu um erro ao tentar compartilhar a imagem', {
      reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : undefined
    })
    return
  }
  await ctxReply(ctx, undefined, getPostimageText(ctxLang, publishStoryResponse.postUrl, String(ctx.from.id), ctx.from.first_name), {
    reply_parameters: (loadingReply?.message_id !== undefined) ? { message_id: loadingReply?.message_id, allow_sending_without_reply: true } : (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
  })
}
