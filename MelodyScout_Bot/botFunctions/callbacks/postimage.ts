import { type CallbackQueryContext, type Context } from 'grammy'
import { githubConfig, instagramConfig, melodyScoutConfig } from '../../../config'
import { ctxAnswerCallbackQuery, ctxEditMessageReplyMarkup, ctxReply, ctxTempReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { MsGithubApi } from '../../../api/msGithubApi/base'
import { zodAIImageMetadata } from '../../../types'
import { MsInstagramApi } from '../../../api/msInstagramApi/base'
import { composeStoryImage } from '../../../functions/mediaEditors'

const postedImages: string[] = []

export async function runPostimageCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const imageId = dataArray[1]
  if (imageId === undefined) {
    void ctxTempReply(ctx, 'Não foi possível encontrar o ID da imagem', 15000)
  }
  void ctxTempReply(ctx, 'Publicando imagem...', 15000)
  const getGithubImagePromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}.jpg`)
  const metadataVersion = zodAIImageMetadata.shape.version.value
  const getGithubMetadataPromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}-${metadataVersion}.json`)
  const [getGithubImage, getGithubMetadata] = await Promise.all([getGithubImagePromise, getGithubMetadataPromise])
  if (!getGithubImage.success) {
    void ctxTempReply(ctx, 'Não foi possível encontrar a imagem', 15000)
    return
  }
  if (!getGithubMetadata.success) {
    void ctxTempReply(ctx, 'Não foi possível encontrar os metadados da imagem ou a versão dos metadados não é compatível com a versão do bot', 15000)
    return
  }
  const image = Buffer.from(getGithubImage.data.content, 'base64')
  const metadata = JSON.parse(Buffer.from(getGithubMetadata.data.content, 'base64').toString())
  const parsedMetadata = zodAIImageMetadata.safeParse(metadata)
  if (!parsedMetadata.success) {
    void ctxTempReply(ctx, 'Não foi possível ler os metadados da imagem', 15000)
    return
  }
  const storiesImageResponse = await composeStoryImage(image)
  if (!storiesImageResponse.success) {
    void ctxTempReply(ctx, 'Não foi possível compor a imagem do stories', 15000)
    return
  }
  if (postedImages.includes(imageId)) {
    void ctxTempReply(ctx, 'Essa imagem já está sendo compartilhada!', 15000)
    return
  }
  postedImages.push(imageId)
  const publishStoryResponse = await new MsInstagramApi(instagramConfig.username, instagramConfig.password).postStory({
    file: storiesImageResponse.storiesImage
  })
  if (!publishStoryResponse.success) {
    postedImages.splice(postedImages.indexOf(imageId), 1)
    void ctxTempReply(ctx, 'Ocorreu um erro ao tentar compartilhar a imagem', 15000)
    return
  }
  const editMessageReplyMarkupResponse = await ctxEditMessageReplyMarkup(ctx, undefined, undefined)
  if (editMessageReplyMarkupResponse instanceof Error) {
    void ctxTempReply(ctx, 'Ocorreu um erro ao tentar compartilhar a imagem', 15000)
    return
  }
  await ctxReply(ctx, undefined, `Imagem compartilhada com sucesso nos stories da conta do MelodyScout no Instagram!\n\n<b><a href="${publishStoryResponse.postUrl}">Ver publicação</a></b>`)
}
