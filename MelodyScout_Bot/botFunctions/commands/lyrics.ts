import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { PrismaDB } from '../../../function/prismaDB/base'
import { getLyricsText } from '../../function/textFabric'
import { MsGeniusApi } from '../../../api/msGeniusApi/base'

export class LyricsCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly prismaDB: PrismaDB
  private readonly msGeniusApi: MsGeniusApi

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB, msGeniusApi: MsGeniusApi) {
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.prismaDB = prismaDB
    this.msGeniusApi = msGeniusApi
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return
    }
    if (ctx.chat?.type === 'private') {
      void this.ctxFunctions.reply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
      return
    }
    const telegramUserId = ctx.from?.id
    if (telegramUserId === undefined) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível identificar seu usuário no telegram, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(`${telegramUserId}`)
    if (!telegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const lastfmUser = telegramUserDBResponse.lastfmUser
    if (lastfmUser === null) {
      void this.ctxFunctions.reply(ctx, 'Para utilizar esse comando envie antes /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
      return
    }
    const userInfoRequest = await this.msLastfmApi.user.getInfo(lastfmUser)
    const userRecentTracksRequest = await this.msLastfmApi.user.getRecentTracks(lastfmUser, 1)
    const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
    if (!userInfo.success) {
      void this.ctxFunctions.reply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact`)
      return
    }
    if (!userRecentTracks.success) {
      void this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    if (userRecentTracks.data.recenttracks.track.length <= 0) {
      void this.ctxFunctions.reply(ctx, 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const mainTrack = {
      trackName: userRecentTracks.data.recenttracks.track[0].name,
      trackMbid: userRecentTracks.data.recenttracks.track[0].mbid,
      albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
      albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
      artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
      artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
      nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
    }
    const albumInfoRequest = this.msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
    const trackLyricsRequest = this.msGeniusApi.getLyrics(userRecentTracks.data.recenttracks.track[0].name, userRecentTracks.data.recenttracks.track[0].artist.name)
    const [albumInfo, trackLyrics] = await Promise.all([albumInfoRequest, trackLyricsRequest])
    if (!albumInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar as informações do álbum dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    if (trackLyrics === null) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar a letra dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    await this.ctxFunctions.reply(ctx, getLyricsText(userInfo.data, userRecentTracks.data, albumInfo.data, trackLyrics, mainTrack.nowPlaying))
  }
}
