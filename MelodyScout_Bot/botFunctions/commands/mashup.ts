import { CommandContext, Context, InlineKeyboard, InputFile } from 'grammy'
import { ctxReply, ctxReplyWithVideo, ctxTempReply } from '../../../function/grammyFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsRaveApi } from '../../../api/msRaveApi/base'
import { RaveContent } from '../../../api/msRaveApi/types/zodRaveContent'
import axios from 'axios'
import { advError } from '../../../function/advancedConsole'
import { lastfmConfig, melodyScoutConfig } from '../../../config'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { lang } from '../../../translations/base'
import { getMashupText } from '../../textFabric/mashup'

export async function runMashupCommand (msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    await ctxReply(ctx, lang(ctxLang, 'unableToGetUserIdErrorMessage'))
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserNotRegistered'))
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserNoMoreRegisteredError'))
    return
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 2)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, lang(ctxLang, 'lastfmUserDataNotFoundedError', { lastfmUser }))
    return
  }
  if (!userRecentTracks.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserRecentTracksHistory', { lastfmUser }))
    return
  }
  console.log(userRecentTracks.data)
  if (userRecentTracks.data.recenttracks.track.length < 2) {
    void ctxReply(ctx, lang(ctxLang, 'mashupNeedTwoTracksError'))
    return
  }
  const mashupTracks = [
    {
      artist: userRecentTracks.data.recenttracks.track[0].artist.name,
      track: userRecentTracks.data.recenttracks.track[0].name
    },
    {
      artist: userRecentTracks.data.recenttracks.track[1].artist.name,
      track: userRecentTracks.data.recenttracks.track[1].name
    }
  ]
  const youtubeTrack1InfoRequest = msMusicApi.getYoutubeTrackInfo(mashupTracks[0].track, mashupTracks[0].artist)
  const youtubeTrack2InfoRequest = msMusicApi.getYoutubeTrackInfo(mashupTracks[1].track, mashupTracks[1].artist)
  const [youtubeTrack1Info, youtubeTrack2Info] = await Promise.all([youtubeTrack1InfoRequest, youtubeTrack2InfoRequest])
  if (!youtubeTrack1Info.success) {
    // void ctxReply(ctx, 'Não foi possível resgatar as informações da primeira música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'mashupUnableToGetFirstTrackInfoErrorMessage'))
    return
  }
  if (!youtubeTrack2Info.success) {
    // void ctxReply(ctx, 'Não foi possível resgatar as informações da segunda música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'mashupUnableToGetSecondTrackInfoErrorMessage'))
    return
  }
  const startProcessMessage = await ctxReply(ctx, lang(ctxLang, 'mashupCreatingDataInformMessage', {
    firstTrackUrl: youtubeTrack1Info.videoUrl,
    firstTrackName: mashupTracks[0].track,
    firstTrackArtist: mashupTracks[0].artist,
    secondTrackUrl: youtubeTrack2Info.videoUrl,
    secondTrackName: mashupTracks[1].track,
    secondTrackArtist: mashupTracks[1].artist
  }), {
    disable_web_page_preview: true
  })
  const youtubeTrack1Id = youtubeTrack1Info.videoId
  const youtubeTrack2Id = youtubeTrack2Info.videoId
  const msRaveApi = new MsRaveApi()
  const raveCreateContentRequest = await msRaveApi.raveApi.createContent({
    style: 'MASHUP',
    tittle: null,
    media: [
      {
        provider: 'YOUTUBE',
        providerId: youtubeTrack1Id
      },
      {
        provider: 'YOUTUBE',
        providerId: youtubeTrack2Id
      }
    ]
  })
  if (!raveCreateContentRequest.success) {
    // void ctxReply(ctx, 'Não foi possível criar o mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'unableToCreateMashupErrorMessage'))
    return
  }
  const mashupId = raveCreateContentRequest.data.data.id
  const raveGetContentRequest = await msRaveApi.raveApi.getInfo(mashupId)
  if (!raveGetContentRequest.success) {
    // void ctxReply(ctx, 'Não foi possível garantir que o mashup foi enviado para criação! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'unableToGetMashupStartCreationConfirmationErrorMessage'))
    return
  }
  const startTime = Date.now()
  // await ctxReply(ctx, 'Beleza! Seu mashup já foi enviado para criação! Essa etapa costuma demorar bastante mas não se preocupe, estou monitorando o processo e te aviso assim que ele estiver pronto! 😊')
  await ctxReply(ctx, lang(ctxLang, 'mashupStartCreationInformMessage'))
  const maxTries = 100
  const timeBetweenTries = 15000
  let tries = 0
  let mashupReady = false
  let lastResponse: RaveContent | undefined
  if (raveGetContentRequest.data.data[0].stage === 'COMPLETE') {
    lastResponse = raveGetContentRequest.data.data[0]
    mashupReady = true
  }
  while (tries < maxTries) {
    tries++
    await new Promise(resolve => setTimeout(resolve, timeBetweenTries))
    console.log(`Checking if mashup is ready... (try ${tries}/${maxTries}) (id: ${mashupId})`)
    const raveGetContentRequest = await msRaveApi.raveApi.getInfo(mashupId)
    if (!raveGetContentRequest.success) {
      continue
    }
    lastResponse = raveGetContentRequest.data.data[0]
    if (raveGetContentRequest.data.data[0].stage === 'COMPLETE') {
      mashupReady = true
      break
    }
  }
  const endTime = Date.now()
  if (!mashupReady) {
    advError(`Mashup creation timed out! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${JSON.stringify(lastResponse)} - URL: https://rave.dj/${mashupId}`)
    // void ctxReply(ctx, 'Infelizmente não foi possível criar o mashup ou ele demorou demais para ser criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'mashupCreationTimeoutErrorMessage'))
    return
  }
  if (lastResponse === undefined) {
    advError(`Mashup last response is undefined! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - URL: https://rave.dj/${mashupId}`)
    // void ctxReply(ctx, 'Não foi possível resgatar as informações do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'unableToGetFinalMashupInfoErrorMessage'))
    return
  }
  // await ctxTempReply(ctx, 'Mashup criado com sucesso! 🎉\nEstou enviando ele para você, por favor aguarde enquanto o Telegram faz o upload do vídeo...', 10000, {
  //   disable_notification: true
  // })
  await ctxTempReply(ctx, lang(ctxLang, 'mashupCreatedInformMessage'), 10000, {
    disable_notification: true
  })
  const mashupUrlThumb = lastResponse?.thumbnails.default ?? melodyScoutConfig.msAndRaveDj
  const mashupUrlAudio = lastResponse?.urls.audio
  const mashupUrlVideo = lastResponse?.urls.default
  if (mashupUrlAudio === undefined || mashupUrlVideo === undefined) {
    advError(`Mashup audio or video URL is undefined! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${mashupUrlAudio === undefined ? 'Audio URL is undefined' : 'Video URL is undefined'} - URL: https://rave.dj/${mashupId}`)
    // void ctxReply(ctx, 'Não foi possível resgatar a URL do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'unableToGetFinalMashupUrlErrorMessage'))
    return
  }
  const thumbResponse = await axios.get(mashupUrlThumb, { responseType: 'arraybuffer' }).catch((err) => { return Error(err) })
  if (thumbResponse instanceof Error) {
    advError(`Error while getting mashup thumbnail in mashup (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${thumbResponse.message} - URL: ${mashupUrlThumb}`)
    // void ctxReply(ctx, 'Não foi possível resgatar a thumbnail do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'unableToGetFinalMashupThumbnailErrorMessage'))
    return
  }
  const thumbBuffer = Buffer.from(thumbResponse.data, 'utf-8')
  const videoResponse = await axios.get(mashupUrlVideo, { responseType: 'arraybuffer' }).catch((err) => { return Error(err) })
  if (videoResponse instanceof Error) {
    advError(`Error while getting mashup video: ${videoResponse.message}`)
    // void ctxReply(ctx, 'Não foi possível resgatar o vídeo do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, lang(ctxLang, 'unableToGetFinalMashupVideoErrorMessage'))
    return
  }
  const videoBuffer = Buffer.from(videoResponse.data, 'utf-8')
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, 'videoButton'), mashupUrlVideo)
  inlineKeyboard.url(lang(ctxLang, 'audioButton'), mashupUrlAudio)
  await ctxReplyWithVideo(ctx, new InputFile(videoBuffer, 'mashup.mp4'), {
    width: 1280,
    height: 720,
    thumb: new InputFile(thumbBuffer, 'mashup.jpg'),
    supports_streaming: false,
    caption: getMashupText(ctxLang, `https://rave.dj/embed/${mashupId}`, lastResponse?.title ?? 'Mashup'),
    reply_markup: inlineKeyboard,
    reply_to_message_id: startProcessMessage?.message_id,
    allow_sending_without_reply: true
  })
}
