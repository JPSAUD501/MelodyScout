import { CallbackQueryContext, CommandContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { PrismaDB } from '../../../function/prismaDB/base'
import { getPnartistText } from '../../function/textFabric'
import { MsMusicApi } from '../../../api/msMusicApi/base'

export class PnartistCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly prismaDB: PrismaDB
  private readonly msMusicApi: MsMusicApi

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msMusicApi: MsMusicApi, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.prismaDB = prismaDB
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CommandContext<Context> | CallbackQueryContext<Context>): Promise<void> {
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
    const userInfoRequest = this.msLastfmApi.user.getInfo(lastfmUser)
    const userRecentTracksRequest = this.msLastfmApi.user.getRecentTracks(lastfmUser, 1)
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
      artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
      artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
      nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
    }
    const artistInfoRequest = this.msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
    const spotifyArtistInfoRequest = this.msMusicApi.getSpotifyArtistInfo(mainTrack.artistName)
    const [artistInfo, spotifyArtistInfo] = await Promise.all([artistInfoRequest, spotifyArtistInfoRequest])
    if (!artistInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    if (!spotifyArtistInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.url('[🎧] - Spotify', spotifyArtistInfo.data.externalURL.spotify)
    await this.ctxFunctions.reply(ctx, getPnartistText(userInfo.data, artistInfo.data, spotifyArtistInfo.data, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  }
}
