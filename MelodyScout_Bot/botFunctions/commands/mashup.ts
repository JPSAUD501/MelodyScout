import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsRaveApi } from '../../../api/msRaveApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { RaveContent } from '../../../api/msRaveApi/types/zodRaveContent'

export class MashupCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly msPrismaDbApi: MsPrismaDbApi
  private readonly msRaveApi: MsRaveApi
  private readonly msMusicApi: MsMusicApi

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi, msMusicApi: MsMusicApi, msRaveApi: MsRaveApi) {
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.msPrismaDbApi = msPrismaDbApi
    this.msRaveApi = msRaveApi
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return
    }
    const telegramUserId = ctx.from?.id
    if (telegramUserId === undefined) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível identificar seu usuário no telegram, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    const checkIfExistsTgUserDBResponse = await this.msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
    if (!checkIfExistsTgUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    if (!checkIfExistsTgUserDBResponse.exists) {
      void this.ctxFunctions.reply(ctx, 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
      return
    }
    const telegramUserDBResponse = await this.msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
    if (!telegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    const lastfmUser = telegramUserDBResponse.lastfmUser
    if (lastfmUser === null) {
      void this.ctxFunctions.reply(ctx, 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
      return
    }
    const userInfoRequest = this.msLastfmApi.user.getInfo(lastfmUser)
    const userRecentTracksRequest = this.msLastfmApi.user.getRecentTracks(lastfmUser, 2)
    const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
    if (!userInfo.success) {
      void this.ctxFunctions.reply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.`)
      return
    }
    if (!userRecentTracks.success) {
      void this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    console.log(userRecentTracks.data)
    if (userRecentTracks.data.recenttracks.track.length < 2) {
      void this.ctxFunctions.reply(ctx, 'Você precisa ter pelo menos duas músicas no seu histórico para que eu possa fazer um mashup! Tente novamente mais tarde.')
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
    await this.ctxFunctions.reply(ctx, `Eba! Vamos lá! Estou criando um mashup com as 2 últimas músicas que você ouviu!\n\n${mashupTracks[0].artist} - ${mashupTracks[0].track}\n${mashupTracks[1].artist} - ${mashupTracks[1].track}`)
    const youtubeTrack1InfoRequest = this.msMusicApi.getYoutubeTrackInfo(mashupTracks[0].track, mashupTracks[0].artist)
    const youtubeTrack2InfoRequest = this.msMusicApi.getYoutubeTrackInfo(mashupTracks[1].track, mashupTracks[1].artist)
    const [youtubeTrack1Info, youtubeTrack2Info] = await Promise.all([youtubeTrack1InfoRequest, youtubeTrack2InfoRequest])
    if (!youtubeTrack1Info.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar as informações da primeira música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    if (!youtubeTrack2Info.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar as informações da segunda música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    const youtubeTrack1Id = youtubeTrack1Info.videoId
    const youtubeTrack2Id = youtubeTrack2Info.videoId
    const raveCreateContentRequest = await this.msRaveApi.raveApi.createContent({
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
      void this.ctxFunctions.reply(ctx, 'Não foi possível criar o mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    console.log(raveCreateContentRequest.data)
    const mashupId = raveCreateContentRequest.data.data.id
    await new Promise(resolve => setTimeout(resolve, 5000))
    const raveGetContentRequest = await this.msRaveApi.raveApi.getInfo(mashupId)
    if (!raveGetContentRequest.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível garantir que o mashup foi enviado para criação! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    await this.ctxFunctions.reply(ctx, 'Beleza! Seu mashup foi enviado para criação! Essa etapa pode demorar um pouco, por favor aguarde...')
    const maxTries = 120
    const timeBetweenTries = 10000
    let tries = 0
    let mashupReady = false
    let lastResponse: RaveContent | undefined
    if (raveGetContentRequest.data.data[0].stage === 'COMPLETE') {
      lastResponse = raveGetContentRequest.data.data[0]
      mashupReady = true
    }
    while (!mashupReady && tries <= maxTries) {
      tries++
      await new Promise(resolve => setTimeout(resolve, timeBetweenTries))
      console.log('Checking mashup status...')
      const raveGetContentRequest = await this.msRaveApi.raveApi.getInfo(mashupId)
      if (!raveGetContentRequest.success) {
        continue
      }
      lastResponse = raveGetContentRequest.data.data[0]
      await this.ctxFunctions.reply(ctx, `${JSON.stringify({
        tries,
        stage: lastResponse?.stage,
        defaultUrl: lastResponse?.urls.default,
        timeEstimate: lastResponse?.timeEstimate,
        percentageComplete: lastResponse?.percentageComplete
      }, null, 2)}`)
      if (raveGetContentRequest.data.data[0].stage === 'COMPLETE') {
        mashupReady = true
      }
    }
    if (!mashupReady) {
      void this.ctxFunctions.reply(ctx, 'Infelizmente não foi possível criar o mashup ou ele demorou demais para ser criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    if (lastResponse === undefined) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar as informações do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    const mashupUrlVideo = lastResponse?.urls.default
    const mashupUrlAudio = lastResponse?.urls.audio
    if (mashupUrlVideo === undefined || mashupUrlAudio === undefined) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar a URL do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
      return
    }
    await this.ctxFunctions.replyWithAudio(ctx, mashupUrlAudio + '/', {
      caption: `Seu mashup está pronto! Segue o link para o download vídeo: ${mashupUrlVideo}`
    })
  }
}
