import { CallbackQueryContext, CommandContext, Context, InlineKeyboard } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { getCallbackKey } from '../../../function/callbackMaker'
import { getPntrackText } from '../../textFabric/pntrack'

export class PntrackCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly msPrismaDbApi: MsPrismaDbApi
  private readonly msMusicApi: MsMusicApi

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi, msMusicApi: MsMusicApi) {
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.msPrismaDbApi = msPrismaDbApi
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
    const checkIfExistsTgUserDBResponse = await this.msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
    if (!checkIfExistsTgUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    if (!checkIfExistsTgUserDBResponse.exists) {
      void this.ctxFunctions.reply(ctx, 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
      return
    }
    const telegramUserDBResponse = await this.msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
    if (!telegramUserDBResponse.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const lastfmUser = telegramUserDBResponse.lastfmUser
    if (lastfmUser === null) {
      void this.ctxFunctions.reply(ctx, 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
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
    if (!albumInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    if (!trackInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    if (!spotifyTrackInfo.success) {
      void this.ctxFunctions.reply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const inlineKeyboard = new InlineKeyboard()
    inlineKeyboard.url('[🎧] - Spotify', spotifyTrackInfo.data.externalURL.spotify)
    if (youtubeTrackInfo.success) inlineKeyboard.url('[🎥] - YouTube', youtubeTrackInfo.videoUrl)
    inlineKeyboard.row()
    inlineKeyboard.text('[📥] - Preview', getCallbackKey(['TP', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
    inlineKeyboard.text('[🧾] - Letra', getCallbackKey(['TL', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
    inlineKeyboard.row()
    inlineKeyboard.text('[✨] - Explicação da música (BETA)', getCallbackKey(['TLE', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
    await this.ctxFunctions.reply(ctx, getPntrackText(userInfo.data, artistInfo.success ? artistInfo.data : undefined, albumInfo.data, trackInfo.data, spotifyTrackInfo.data, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  }
}
