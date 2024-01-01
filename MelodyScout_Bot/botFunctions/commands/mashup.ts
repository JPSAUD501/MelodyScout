import { type CommandContext, type Context, InlineKeyboard, InputFile } from 'grammy'
import { ctxReply, ctxReplyWithVideo, ctxTempReply } from '../../../functions/grammyFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsRaveApi } from '../../../api/msRaveApi/base'
import { type RaveContent } from '../../../api/msRaveApi/types/zodRaveContent'
import axios from 'axios'
import { advError } from '../../../functions/advancedConsole'
import { lastfmConfig, melodyScoutConfig, spotifyConfig } from '../../../config'

import { lang } from '../../../translations/base'
import { getMashupText } from '../../textFabric/mashup'
import { MsMusicApi } from '../../../api/msMusicApi/base'

export async function runMashupCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return
  }
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }))
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserNotRegistered', value: 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }))
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserNoMoreRegisteredError', value: 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }))
    return
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 2, 1)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }))
    return
  }
  if (!userRecentTracks.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserRecentTracksHistory', value: 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }))
    return
  }
  console.log(userRecentTracks.data)
  if (userRecentTracks.data.recenttracks.track.length < 2) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'mashupNeedTwoTracksError', value: 'Você precisa ter pelo menos duas músicas no seu histórico para que eu possa fazer um mashup! Tente novamente mais tarde.' }))
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
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const youtubeTrack1InfoRequest = msMusicApi.getYoutubeTrackInfo(mashupTracks[0].track, mashupTracks[0].artist)
  const youtubeTrack2InfoRequest = msMusicApi.getYoutubeTrackInfo(mashupTracks[1].track, mashupTracks[1].artist)
  const [youtubeTrack1Info, youtubeTrack2Info] = await Promise.all([youtubeTrack1InfoRequest, youtubeTrack2InfoRequest])
  if (!youtubeTrack1Info.success) {
    // void ctxReply(ctx, undefined, 'Não foi possível resgatar as informações da primeira música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'mashupUnableToGetFirstTrackInfoErrorMessage', value: 'Não foi possível resgatar as informações da primeira música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!youtubeTrack2Info.success) {
    // void ctxReply(ctx, undefined, 'Não foi possível resgatar as informações da segunda música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'mashupUnableToGetSecondTrackInfoErrorMessage', value: 'Não foi possível resgatar as informações da segunda música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const startProcessMessage = await ctxReply(ctx, undefined, lang(ctxLang, { key: 'mashupCreatingDataInformMessage', value: 'Eba! Vamos lá! Estou criando um mashup com as 2 últimas músicas que você ouviu!\n\n- <b><a href="{{firstTrackUrl}}">{{firstTrackName}} de {{firstTrackArtist}}</a></b>\n- <b><a href="{{secondTrackUrl}}">{{secondTrackName}} de {{secondTrackArtist}}</a></b>' }, {
    firstTrackUrl: youtubeTrack1Info.videoUrl,
    firstTrackName: mashupTracks[0].track,
    firstTrackArtist: mashupTracks[0].artist,
    secondTrackUrl: youtubeTrack2Info.videoUrl,
    secondTrackName: mashupTracks[1].track,
    secondTrackArtist: mashupTracks[1].artist
  }), {
    link_preview_options: {
      is_disabled: true
    }
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
    // void ctxReply(ctx, undefined, 'Não foi possível criar o mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToCreateMashupErrorMessage', value: 'Não foi possível criar o mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), {
      reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
      disable_notification: true
    })
    return
  }
  const mashupId = raveCreateContentRequest.data.data.id
  const raveGetContentRequest = await msRaveApi.raveApi.getInfo(mashupId)
  if (!raveGetContentRequest.success) {
    // void ctxReply(ctx, undefined, 'Não foi possível garantir que o mashup foi enviado para criação! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetMashupStartCreationConfirmationErrorMessage', value: 'Não foi possível garantir que o mashup foi enviado para criação! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), {
      reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
      disable_notification: true
    })
    return
  }
  const startTime = Date.now()
  // await ctxReply(ctx, undefined, 'Beleza! Seu mashup já foi enviado para criação! Essa etapa costuma demorar bastante mas não se preocupe, estou monitorando o processo e te aviso assim que ele estiver pronto! 😊')
  await ctxReply(ctx, undefined, lang(ctxLang, { key: 'mashupStartCreationInformMessage', value: 'Beleza! Seu mashup já foi enviado para criação! Essa etapa costuma demorar bastante mas não se preocupe, estou monitorando o processo e te aviso assim que ele estiver pronto! 😊' }), {
    reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
    disable_notification: true
  })
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
    // void ctxReply(ctx, undefined, 'Infelizmente não foi possível criar o mashup ou ele demorou demais para ser criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'mashupCreationTimeoutErrorMessage', value: 'Infelizmente não foi possível criar o mashup ou ele demorou demais para ser criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), {
      reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
      disable_notification: true
    })
    return
  }
  if (lastResponse === undefined) {
    advError(`Mashup last response is undefined! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - URL: https://rave.dj/${mashupId}`)
    // void ctxReply(ctx, undefined, 'Não foi possível resgatar as informações do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetFinalMashupInfoErrorMessage', value: 'Não foi possível resgatar as informações do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), {
      reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
      disable_notification: true
    })
    return
  }
  // await ctxTempReply(ctx, 'Mashup criado com sucesso! 🎉\nEstou enviando ele para você, por favor aguarde enquanto o Telegram faz o upload do vídeo...', 10000, {
  //   disable_notification: true
  // })
  await ctxTempReply(ctx, lang(ctxLang, { key: 'mashupCreatedInformMessage', value: 'Mashup criado com sucesso! 🎉\nEstou enviando ele para você, por favor aguarde enquanto o Telegram faz o upload do vídeo…' }), 10000, {
    reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
    disable_notification: true
  })
  const mashupUrlThumb = lastResponse?.thumbnails.default ?? melodyScoutConfig.msAndRaveDj
  const mashupUrlAudio = lastResponse?.urls.audio
  const mashupUrlVideo = lastResponse?.urls.default
  if (mashupUrlAudio === undefined || mashupUrlVideo === undefined) {
    advError(`Mashup audio or video URL is undefined! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${mashupUrlAudio === undefined ? 'Audio URL is undefined' : 'Video URL is undefined'} - URL: https://rave.dj/${mashupId}`)
    // void ctxReply(ctx, undefined, 'Não foi possível resgatar a URL do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetFinalMashupUrlErrorMessage', value: 'Não foi possível resgatar a URL do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), {
      reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
      disable_notification: true
    })
    return
  }
  const thumbResponse = await axios.get(mashupUrlThumb, { responseType: 'arraybuffer' }).catch((err) => { return Error(err) })
  if (thumbResponse instanceof Error) {
    advError(`Error while getting mashup thumbnail in mashup (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${thumbResponse.message} - URL: ${mashupUrlThumb}`)
    // void ctxReply(ctx, undefined, 'Não foi possível resgatar a thumbnail do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetFinalMashupThumbnailErrorMessage', value: 'Não foi possível resgatar a thumbnail do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), {
      reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
      disable_notification: true
    })
    return
  }
  const thumbBuffer = Buffer.from(thumbResponse.data, 'utf-8')
  const videoResponse = await axios.get(mashupUrlVideo, { responseType: 'arraybuffer' }).catch((err) => { return Error(err) })
  if (videoResponse instanceof Error) {
    advError(`Error while getting mashup video: ${videoResponse.message}`)
    // void ctxReply(ctx, undefined, 'Não foi possível resgatar o vídeo do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetFinalMashupVideoErrorMessage', value: 'Não foi possível resgatar o vídeo do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), {
      reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined,
      disable_notification: true
    })
    return
  }
  const videoBuffer = Buffer.from(videoResponse.data, 'utf-8')
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, { key: 'videoButton', value: '[🎬] - Vídeo' }), mashupUrlVideo)
  inlineKeyboard.url(lang(ctxLang, { key: 'audioButton', value: '[🎧] - Áudio' }), mashupUrlAudio)
  await ctxReplyWithVideo(ctx, new InputFile(videoBuffer, 'mashup.mp4'), {
    width: 1280,
    height: 720,
    thumbnail: new InputFile(thumbBuffer, 'mashup.jpg'),
    supports_streaming: false,
    caption: getMashupText(ctxLang, `https://rave.dj/embed/${mashupId}`, lastResponse?.title ?? 'Mashup'),
    reply_markup: inlineKeyboard,
    reply_parameters: (startProcessMessage?.message_id !== undefined) ? { message_id: startProcessMessage?.message_id, allow_sending_without_reply: true } : undefined
  })
}
