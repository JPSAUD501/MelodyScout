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

const loadingMashupMessages = [
  'Estamos trabalhando duro no seu mashup! Logo estará pronto. Por favor, aguarde!',
  'Seu mashup está sendo cuidadosamente criado. Agradecemos a sua paciência!',
  'Nosso time está ocupado criando seu mashup incrível. Aproveite esse tempo para ficar ainda mais ansioso!',
  'Seu mashup está em processo de produção. Em breve, você terá algo fantástico em suas mãos!',
  'Sabemos que você está ansioso pelo seu mashup. Fique tranquilo, estamos cuidando de tudo!',
  'Sua espera pelo mashup está chegando ao fim. Agradecemos por sua paciência e prometemos que valerá a pena!',
  'Estamos trabalhando com dedicação no seu mashup. Em breve, você poderá aproveitar o resultado final!',
  'Ainda estamos desenvolvendo o seu mashup personalizado. Obrigado por aguardar. Será sensacional!',
  'Seu mashup está em andamento. Aprecie a antecipação, em breve você será surpreendido!',
  'Estamos investindo tempo e energia para criar o seu mashup perfeito. Agradecemos por sua compreensão!',
  'Seu mashup está em fase de produção. Continue aguardando, logo você será recompensado!',
  'Queremos que o seu mashup seja perfeito. A paciência é uma virtude que será recompensada em breve!',
  'Seu mashup está em processo criativo. Agradeça pelo tempo extra, pois estamos garantindo um resultado excepcional!',
  'Sua espera pelo mashup está quase no fim. Agradecemos por sua confiança e prometemos superar suas expectativas!',
  'Estamos fazendo de tudo para entregar um mashup excepcional. Aproveite a ansiedade, pois em breve será recompensado!',
  'Seu mashup está sendo produzido com carinho e dedicação. Fique tranquilo, você será notificado assim que estiver pronto!',
  'Continuamos trabalhando arduamente no seu mashup personalizado. Agradecemos por sua paciência e confiança!',
  'Seu mashup está em andamento. Aproveite essa jornada, em breve você terá algo único nas suas mãos!',
  'Estamos dando os toques finais no seu mashup incrível. Obrigado por esperar, valerá a pena!',
  'Seu mashup está sendo preparado com todo cuidado. Fique empolgado, pois em breve ele estará pronto para você aproveitar!'
]

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
    void ctxReply(ctx, 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    void ctxReply(ctx, 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    return
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 2)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.`)
    return
  }
  if (!userRecentTracks.success) {
    void ctxReply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  console.log(userRecentTracks.data)
  if (userRecentTracks.data.recenttracks.track.length < 2) {
    void ctxReply(ctx, 'Você precisa ter pelo menos duas músicas no seu histórico para que eu possa fazer um mashup! Tente novamente mais tarde.')
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
    void ctxReply(ctx, 'Não foi possível resgatar as informações da primeira música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (!youtubeTrack2Info.success) {
    void ctxReply(ctx, 'Não foi possível resgatar as informações da segunda música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const startProcessMessage = await ctxReply(ctx, `Eba! Vamos lá! Estou criando um mashup com as 2 últimas músicas que você ouviu!\n\n- <b><a href="${youtubeTrack1Info.videoUrl}">${mashupTracks[0].track} de ${mashupTracks[0].artist}</a></b>\n- <b><a href="${youtubeTrack2Info.videoUrl}">${mashupTracks[1].track} de ${mashupTracks[1].artist}</a></b>`, {
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
    void ctxReply(ctx, 'Não foi possível criar o mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const mashupId = raveCreateContentRequest.data.data.id
  const raveGetContentRequest = await msRaveApi.raveApi.getInfo(mashupId)
  if (!raveGetContentRequest.success) {
    void ctxReply(ctx, 'Não foi possível garantir que o mashup foi enviado para criação! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const startTime = Date.now()
  await ctxReply(ctx, 'Beleza! Seu mashup já foi enviado para criação! Essa etapa pode demorar um pouco, por favor aguarde...')
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
    await ctxTempReply(ctx, `<i>${loadingMashupMessages[Math.floor(Math.random() * loadingMashupMessages.length)]}</i>\n\n<b>Etapa:</b> ${raveGetContentRequest.data.data[0].stage ?? 'Desconhecida'}`, timeBetweenTries + 2000, {
      disable_notification: true
    })
  }
  const endTime = Date.now()
  if (!mashupReady) {
    advError(`Mashup creation timed out! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${JSON.stringify(lastResponse)} - URL: https://rave.dj/${mashupId}`)
    void ctxReply(ctx, 'Infelizmente não foi possível criar o mashup ou ele demorou demais para ser criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (lastResponse === undefined) {
    advError(`Mashup last response is undefined! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - URL: https://rave.dj/${mashupId}`)
    void ctxReply(ctx, 'Não foi possível resgatar as informações do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  await ctxTempReply(ctx, 'Mashup criado com sucesso! 🎉\nEstou enviando ele para você, por favor aguarde enquanto o Telegram faz o upload do vídeo...', 10000, {
    disable_notification: true
  })
  const mashupUrlThumb = lastResponse?.thumbnails.default ?? melodyScoutConfig.msAndRaveDj
  const mashupUrlAudio = lastResponse?.urls.audio
  const mashupUrlVideo = lastResponse?.urls.default
  if (mashupUrlAudio === undefined || mashupUrlVideo === undefined) {
    advError(`Mashup audio or video URL is undefined! (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${mashupUrlAudio === undefined ? 'Audio URL is undefined' : 'Video URL is undefined'} - URL: https://rave.dj/${mashupId}`)
    void ctxReply(ctx, 'Não foi possível resgatar a URL do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const thumbResponse = await axios.get(mashupUrlThumb, { responseType: 'arraybuffer' }).catch((err) => { return Error(err) })
  if (thumbResponse instanceof Error) {
    advError(`Error while getting mashup thumbnail in mashup (id: ${mashupId}) (time: ${(endTime - startTime) / 1000}s) - ${thumbResponse.message} - URL: ${mashupUrlThumb}`)
    void ctxReply(ctx, 'Não foi possível resgatar a thumbnail do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const thumbBuffer = Buffer.from(thumbResponse.data, 'utf-8')
  const videoResponse = await axios.get(mashupUrlVideo, { responseType: 'arraybuffer' }).catch((err) => { return Error(err) })
  if (videoResponse instanceof Error) {
    advError(`Error while getting mashup video: ${videoResponse.message}`)
    void ctxReply(ctx, 'Não foi possível resgatar o vídeo do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const videoBuffer = Buffer.from(videoResponse.data, 'utf-8')
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url('[🎬] - Vídeo', mashupUrlVideo)
  inlineKeyboard.url('[🎧] - Audio', mashupUrlAudio)
  await ctxReplyWithVideo(ctx, new InputFile(videoBuffer, 'mashup.mp4'), {
    width: 1280,
    height: 720,
    thumb: new InputFile(thumbBuffer, 'mashup.jpg'),
    supports_streaming: false,
    caption: `Espero que goste! 😊\n\n<b><a href="https://rave.dj/embed/${mashupId}">${lastResponse?.title ?? 'Mashup'} por RaveDJ</a></b>\n\nVocê pode também fazer o download do vídeo ou audio do mashup clicando nos botões abaixo!`,
    reply_markup: inlineKeyboard,
    reply_to_message_id: startProcessMessage?.message_id,
    allow_sending_without_reply: true
  })
}
