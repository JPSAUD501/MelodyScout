import { type CallbackQueryContext, type Context } from 'grammy'
import { melodyScoutConfig, openaiConfig, spotifyConfig } from '../../../config'
import { ctxAnswerCallbackQuery, ctxEditMessageReplyMarkup, ctxReply, ctxTempReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { zodAIImageMetadata } from '../../../types'
import { getPostimageText } from '../../textFabric/postimage'
import { msFirebaseApi } from '../../bot'
import { MsBlueskyApi } from '../../../api/msBlueskyApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'
import type { Track } from '@soundify/web-api'
import type { DeezerTrack } from '../../../api/msDeezerApi/types/zodSearchTrack'
import { MsOpenAiApi } from '../../../api/msOpenAiApi/base'

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
  const geFirebaseImagePromise = msFirebaseApi.getFile('images/ai', `${imageId}.jpg`)
  const [getFirebaseImage] = await Promise.all([geFirebaseImagePromise])
  if (!getFirebaseImage.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! A imagem não foi encontrada no sistema!', {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const metadata = getFirebaseImage.metadata
  const parsedMetadata = zodAIImageMetadata.safeParse(metadata)
  if (!parsedMetadata.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! As informações da imagem são invalidas!', {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(parsedMetadata.data.trackName, parsedMetadata.data.artistName)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(parsedMetadata.data.trackName, parsedMetadata.data.artistName)
  const deezerTrackInfoRequest = new MsDeezerApi().search.track(parsedMetadata.data.trackName, parsedMetadata.data.artistName, 1)
  const [spotifyTrackInfo, youtubeTrackInfo, deezerTrackInfo] = await Promise.all([spotifyTrackInfoRequest, youtubeTrackInfoRequest, deezerTrackInfoRequest])
  const spotifyTrack: Track | undefined = spotifyTrackInfo.success && spotifyTrackInfo.data.length > 0 ? spotifyTrackInfo.data[0] : undefined
  const deezerTrack: DeezerTrack | undefined = deezerTrackInfo.success && deezerTrackInfo.data.data.length > 0 ? deezerTrackInfo.data.data[0] : undefined
  const mainTrackUrl = spotifyTrack?.external_urls.spotify ?? (youtubeTrackInfo.success ? youtubeTrackInfo.videoUrl : undefined) ?? deezerTrack?.link
  if (mainTrackUrl === undefined) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Não foi possível compartilhar a imagem! Não foi possível encontrar a música no Spotify, YouTube ou Deezer!', {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const briefImageDescription = await new MsOpenAiApi(openaiConfig.apiKey).getBriefImageDescription(parsedMetadata.data.imageDescription)
  const postImageAlt = briefImageDescription.success ? briefImageDescription.description : parsedMetadata.data.imageDescription
  const msBlueskyApi = new MsBlueskyApi()
  const postText = `${parsedMetadata.data.trackName} by ${parsedMetadata.data.artistName}\n${mainTrackUrl}`
  const postResponse = await msBlueskyApi.post(postText, getFirebaseImage.file, postImageAlt)
  if (!postResponse.success) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Ocorreu um erro ao tentar compartilhar a imagem', {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  const editMessageReplyMarkupResponse = await ctxEditMessageReplyMarkup(ctx, undefined, undefined)
  if (editMessageReplyMarkupResponse instanceof Error) {
    postedImages[imageId] = false
    await ctxReply(ctx, undefined, 'Ocorreu um erro ao tentar compartilhar a imagem', {
      reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined
    })
    return
  }
  await ctxReply(ctx, undefined, getPostimageText(ctxLang, postResponse.postUrl, String(ctx.from.id), ctx.from.first_name), {
    reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined,
    link_preview_options: {
      show_above_text: true
    }
  })
}
