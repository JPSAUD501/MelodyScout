import { CallbackQueryContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { PrismaDB } from '../../../function/prismaDB/base'
import { getPlayingnowText } from '../../function/textFabric'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import msConfig from '../../../config'

export class PlayingnowCallback {
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly prismaDB: PrismaDB
  private readonly msMusicApi: MsMusicApi

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB, msMusicApi: MsMusicApi) {
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.prismaDB = prismaDB
    this.msMusicApi = msMusicApi
  }

  async run (ctx: CallbackQueryContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') {
      void this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Eu não funciono em canais!')
      return
    }
    if (ctx.chat?.type === 'private') {
      void this.ctxFunctions.reply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Eu não funciono em conversas privadas!')
      return
    }
    void this.ctxFunctions.answerCallbackQuery(ctx, '⏳ - Carregando...')
    const telegramUserId = ctx.from.id
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(`${telegramUserId}`)
    if (!telegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao tentar resgatar suas informações do banco de dados!')
      return
    }
    const lastfmUser = telegramUserDBResponse.lastfmUser
    if (lastfmUser === null) {
      void this.ctxFunctions.reply(ctx, 'Para utilizar esse comando envie antes /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Você ainda não possui um usuário do Last.fm registrado!')
      return
    }
    const userInfoRequest = this.msLastfmApi.user.getInfo(lastfmUser)
    const userRecentTracksRequest = this.msLastfmApi.user.getRecentTracks(lastfmUser, 1)
    const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
    if (!userInfo.success) {
      void this.ctxFunctions.reply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact`)
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao tentar resgatar suas informações!')
      return
    }
    if (!userRecentTracks.success) {
      void this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao tentar resgatar o histórico do seu perfil!')
      return
    }
    if (userRecentTracks.data.recenttracks.track.length <= 0) {
      void this.ctxFunctions.reply(ctx, 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao tentar resgatar o histórico do seu perfil!')
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
    const artistInfoRequest = this.msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
    const albumInfoRequest = this.msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
    const trackInfoRequest = this.msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
    const spotifyTrackInfoRequest = this.msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
    const youtubeTrackInfoRequest = this.msMusicApi.getYoutubeTrackInfo(mainTrack.trackName, mainTrack.artistName)
    const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest])
    if (!artistInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao buscar informações do artista!')
      return
    }
    if (!albumInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao buscar informações do álbum!')
      return
    }
    if (!trackInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao buscar informações da música!')
      return
    }
    if (!spotifyTrackInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao buscar informações do Spotify!')
      return
    }
    if (!youtubeTrackInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do YouTube da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      void this.ctxFunctions.answerCallbackQuery(ctx, '⚠ - Erro ao buscar informações do YouTube!')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
      .url('[🎵] - Spotify', spotifyTrackInfo.trackUrl)
      .url('[🎥] - YouTube', youtubeTrackInfo.videoUrl)
      .row()
      .text('[📥] - Preview', `TP${msConfig.melodyScout.divider}${mainTrack.trackName.replace(/  +/g, ' ')}${msConfig.melodyScout.divider}${mainTrack.artistName.replace(/  +/g, ' ')}`)
      .text('[🧾] - Letra', `TL${msConfig.melodyScout.divider}${mainTrack.trackName.replace(/  +/g, ' ')}${msConfig.melodyScout.divider}${mainTrack.artistName.replace(/  +/g, ' ')}`)
    await this.ctxFunctions.reply(ctx, getPlayingnowText(userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  }
}
