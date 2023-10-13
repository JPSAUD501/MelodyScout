import { type CallbackQueryContext, type Context } from 'grammy'
import { githubConfig, melodyScoutConfig } from '../../../config'
import { ctxAnswerCallbackQuery, ctxTempReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { MsGithubApi } from '../../../api/msGithubApi/base'
import { zodAIImageMetadata } from '../../../types'

export async function runPostimageCallback (ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'loadingInformCallback'))
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const imageId = dataArray[1]
  if (imageId === undefined) {
    void ctxTempReply(ctx, 'Não foi possível encontrar o ID da imagem', 15000)
  }
  const getGithubImagePromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}.jpg`)
  const metadataVersion = zodAIImageMetadata.shape.version.value
  const getGithubMetadataPromise = new MsGithubApi(githubConfig.token).files.getFile(`${imageId}-${metadataVersion}.json`)
  const [getGithubImage, getGithubMetadata] = await Promise.all([getGithubImagePromise, getGithubMetadataPromise])
  if (!getGithubImage.success) {
    void ctxTempReply(ctx, 'Não foi possível encontrar a imagem', 15000)
    return
  }
  if (!getGithubMetadata.success) {
    void ctxTempReply(ctx, 'Não foi possível encontrar os metadados da imagem', 15000)
    return
  }
  // const image = Buffer.from(getGithubImage.data.content, 'base64')
  const metadata = JSON.parse(Buffer.from(getGithubMetadata.data.content, 'base64').toString())
  const parsedMetadata = zodAIImageMetadata.safeParse(metadata)
  if (!parsedMetadata.success) {
    void ctxTempReply(ctx, 'Não foi possível ler os metadados da imagem', 15000)
    return
  }
  await ctxTempReply(ctx, 'Ainda estamos trabalhando nessa função! Aguarde novidades em breve!', 15000)
}
