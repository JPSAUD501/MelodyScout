import { CommandContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { PrismaDB } from '../../../function/prismaDB/base'
import { getPlayingnowText } from '../../function/textFabric'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import msConfig from '../../../config'

export class PlayingnowCommand {
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

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    if (ctx.chat?.type === 'private') return await this.ctxFunctions.reply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
    const telegramUserId = ctx.from?.id
    if (telegramUserId === undefined) return await this.ctxFunctions.reply(ctx, 'Não foi possível identificar seu usuário no telegram, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(`${telegramUserId}`)
    if (!telegramUserDBResponse.success) return await this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const lastfmUser = telegramUserDBResponse.lastfmUser
    if (lastfmUser === null) return await this.ctxFunctions.reply(ctx, 'Para utilizar esse comando envie antes /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    const userInfo = await this.msLastfmApi.user.getInfo(lastfmUser)
    if (!userInfo.success) return await this.ctxFunctions.reply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact`)
    const userRecentTracks = await this.msLastfmApi.user.getRecentTracks(lastfmUser, 1)
    if (!userRecentTracks.success) return await this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    if (userRecentTracks.data.recenttracks.track.length <= 0) return await this.ctxFunctions.reply(ctx, 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const mainTrack = {
      trackName: userRecentTracks.data.recenttracks.track[0].name,
      trackMbid: userRecentTracks.data.recenttracks.track[0].mbid,
      albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
      albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
      artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
      artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
      nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
    }
    const artistInfo = await this.msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
    if (!artistInfo.success) return await this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const albumInfo = await this.msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
    if (!albumInfo.success) return await this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const trackInfo = await this.msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
    if (!trackInfo.success) return await this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const spotifyTrackInfo = await this.msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
    if (!spotifyTrackInfo.success) return await this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    // replace all non alphanumeric characters with spaces
    const inlineKeyboard = new InlineKeyboard()
      .url('Ouvir no Spotify', spotifyTrackInfo.trackUrl).row()
      .text('Preview', `TP${msConfig.melodyScout.divider}${mainTrack.trackName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/  +/g, ' ')}${msConfig.melodyScout.divider}${mainTrack.artistName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/  +/g, ' ')}`).row()
      .text('[📥] - Áudio', `TD${msConfig.melodyScout.divider}${mainTrack.trackName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/  +/g, ' ')}${msConfig.melodyScout.divider}${mainTrack.artistName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/  +/g, ' ')}`)
      .text('[📥] - Vídeo', `TVD${msConfig.melodyScout.divider}${mainTrack.trackName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/  +/g, ' ')}${msConfig.melodyScout.divider}${mainTrack.artistName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/  +/g, ' ')}`)
    await this.ctxFunctions.reply(ctx, getPlayingnowText(userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  }
}
