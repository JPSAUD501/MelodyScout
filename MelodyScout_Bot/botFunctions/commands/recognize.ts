import { type CommandContext, type Context, InlineKeyboard } from 'grammy'
import { ctxReply, ctxTempReply } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import { getTrackPreview } from '../../../functions/getTrackPreview'
import { MsAcrCloudApi } from '../../../api/msAcrCloudApi/base'
import { acrCloudConfig, spotifyConfig } from '../../../config'
import { getRecognizeText } from '../../textFabric/recognize'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { type AcrCloudTrack } from '../../../api/msAcrCloudApi/types/zodIdentifyTrack'
import { getCallbackKey } from '../../../functions/callbackMaker'
import { type DeezerTrack } from '../../../api/msDeezerApi/types/zodSearchTrack'
import { type Track } from '@soundify/web-api'

const minSampleTime = 5
const maxSampleTime = 120

export async function runRecognizeCommand (ctx: CommandContext<Context>): Promise<void> {
  await ctx.reply('Esse recurso ainda está em desenvolvimento e por isso pode não funcionar corretamente!')
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return
  }
  const ctxFrom = ctx.from
  if (ctxFrom === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }))
    return
  }
  const messageId = ctx.message?.message_id
  const messageReplyToMessage = ctx.message?.reply_to_message
  if (messageReplyToMessage === undefined) {
    void ctxReply(ctx, undefined, `Envie um áudio com duração entre ${minSampleTime} e ${maxSampleTime} segundos e responda ele com o comando /recognize para que eu possa identificar a música!`)
    return
  }
  const file = messageReplyToMessage.voice ?? messageReplyToMessage.audio
  if (file === undefined) {
    void ctxReply(ctx, undefined, `Envie um áudio com duração entre ${minSampleTime} e ${maxSampleTime} segundos e responda ele com o comando /recognize para que eu possa identificar a música!`)
    return
  }
  if (file.duration > maxSampleTime || file.duration < minSampleTime) {
    await ctxReply(ctx, undefined, `A duração do áudio deve estar entre ${minSampleTime} e ${maxSampleTime} segundos para que eu possa identificar a música!`)
    return
  }
  void ctxTempReply(ctx, '⏳ - Procurando musicas parecidas! Aguarde um momento...', 8000, {
    reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined,
    disable_notification: true
  })
  const telegramFile = await ctx.api.getFile(file.file_id).catch((err) => { return new Error(err) })
  if (telegramFile instanceof Error) {
    await ctxReply(ctx, undefined, 'Ocorreu um erro interno ao tentar obter o audio que você enviou, por favor tente novamente mais tarde!')
    return
  }
  const audioFile = await telegramFile.arrayBuffer().catch((err) => { return new Error(err) })
  if (audioFile instanceof Error) {
    await ctxReply(ctx, undefined, 'Ocorreu um erro interno ao tentar baixar o audio que você enviou, por favor tente novamente mais tarde!')
    return
  }
  const identifyResponse = await new MsAcrCloudApi(acrCloudConfig.accessKey, acrCloudConfig.secretKey).identify.track(Buffer.from(audioFile))
  if (!identifyResponse.success) {
    await ctxReply(ctx, undefined, 'Ocorreu um erro interno ao tentar identificar o audio que você enviou, por favor tente novamente mais tarde!')
    return
  }
  const recognizedTracks: Array<{
    recognizeType: 'music' | 'humming'
    track: AcrCloudTrack
  }> = []
  if (identifyResponse.data.metadata.music !== undefined) {
    for (const recognizedMusicTrack of identifyResponse.data.metadata.music) {
      recognizedTracks.push({
        recognizeType: 'music',
        track: recognizedMusicTrack
      })
    }
  }
  if (identifyResponse.data.metadata.humming !== undefined) {
    for (const recognizedHummingTrack of identifyResponse.data.metadata.humming) {
      recognizedTracks.push({
        recognizeType: 'humming',
        track: recognizedHummingTrack
      })
    }
  }
  recognizedTracks.sort((a, b) => b.track.score - a.track.score)
  if (recognizedTracks.length <= 0) {
    await ctxReply(ctx, undefined, 'Infelizmente não consegui identificar nenhuma música no áudio que você enviou!')
    return
  }
  const recognizedTrack = recognizedTracks[0]
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(recognizedTrack.track.title, recognizedTrack.track.artists[0].name)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(recognizedTrack.track.title, recognizedTrack.track.artists[0].name)
  const deezerTrackInfoRequest = new MsDeezerApi().search.track(recognizedTrack.track.title, recognizedTrack.track.artists[0].name, 1)
  const trackPreviewRequest = getTrackPreview(recognizedTrack.track.title, recognizedTrack.track.artists[0].name, ctx)
  const [spotifyTrackInfo, youtubeTrackInfo, deezerTrackInfo, trackPreview] = await Promise.all([spotifyTrackInfoRequest, youtubeTrackInfoRequest, deezerTrackInfoRequest, trackPreviewRequest])
  const spotifyTrack: Track | undefined = spotifyTrackInfo.success && spotifyTrackInfo.data.length > 0 ? spotifyTrackInfo.data[0] : undefined
  const deezerTrack: DeezerTrack | undefined = deezerTrackInfo.success && deezerTrackInfo.data.data.length > 0 ? deezerTrackInfo.data.data[0] : undefined
  const trackPreviewUrl = trackPreview.success ? trackPreview.telegramPreviewUrl : undefined
  const inlineKeyboard = new InlineKeyboard()
  if (trackPreviewUrl === undefined) {
    inlineKeyboard.text(lang(ctxLang, { key: 'trackPreviewButton', value: '[📥] - Visualizar' }), getCallbackKey(['TP', recognizedTrack.track.title.replace(/  +/g, ' '), recognizedTrack.track.artists[0].name.replace(/  +/g, ' ')]))
    inlineKeyboard.row()
  }
  if (spotifyTrack !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'spotifyButton', value: '[🎧] - Spotify' }), spotifyTrack.external_urls.spotify)
  if (deezerTrack !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'deezerButton', value: '[🎧] - Deezer' }), deezerTrack.link)
  inlineKeyboard.row()
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeButton', value: '[🎥] - YouTube' }), youtubeTrackInfo.videoUrl)
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeMusicButton', value: '[🎶] - YT Music' }), youtubeTrackInfo.videoMusicUrl)
  inlineKeyboard.row()
  await ctxReply(ctx, undefined, getRecognizeText(ctxLang, recognizedTrack.recognizeType, recognizedTrack.track, trackPreviewUrl, ctx.from.id.toString(), ctx.from.first_name), {
    reply_parameters: {
      message_id: messageReplyToMessage.message_id,
      allow_sending_without_reply: true
    },
    reply_markup: inlineKeyboard
  })
}
