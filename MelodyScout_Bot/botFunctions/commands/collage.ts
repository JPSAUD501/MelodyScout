import { CommandContext, Context, InlineKeyboard, InputFile } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { MsImgFabricApi } from '../../../api/msImgFabricApi/base'
import config from '../../../config'

export class CollageCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly msPrismaDbApi: MsPrismaDbApi
  private readonly msMusicApi: MsMusicApi
  private readonly msImgFabricApi: MsImgFabricApi

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi, msMusicApi: MsMusicApi, msImgFabricApi: MsImgFabricApi) {
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.msPrismaDbApi = msPrismaDbApi
    this.msMusicApi = msMusicApi
    this.msImgFabricApi = msImgFabricApi
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
    const userTopTracks = await this.msLastfmApi.user.getTopTracks(lastfmUser, 9)
    if (!userTopTracks.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar suas músicas mais tocadas do Last.fm, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const userTopTracksList = userTopTracks.data.toptracks.track
    if (userTopTracksList.length < 9) {
      void this.ctxFunctions.reply(ctx, 'Parece que você não possui músicas suficientes para criar um collage, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }
    const spotifyTrack1Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[0].name, userTopTracksList[0].artist.name)
    const spotifyTrack2Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[1].name, userTopTracksList[1].artist.name)
    const spotifyTrack3Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[2].name, userTopTracksList[2].artist.name)
    const spotifyTrack4Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[3].name, userTopTracksList[3].artist.name)
    const spotifyTrack5Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[4].name, userTopTracksList[4].artist.name)
    const spotifyTrack6Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[5].name, userTopTracksList[5].artist.name)
    const spotifyTrack7Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[6].name, userTopTracksList[6].artist.name)
    const spotifyTrack8Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[7].name, userTopTracksList[7].artist.name)
    const spotifyTrack9Promise = this.msMusicApi.getSpotifyTrackInfo(userTopTracksList[8].name, userTopTracksList[8].artist.name)
    const [spotifyTrack1, spotifyTrack2, spotifyTrack3, spotifyTrack4, spotifyTrack5, spotifyTrack6, spotifyTrack7, spotifyTrack8, spotifyTrack9] = await Promise.all([spotifyTrack1Promise, spotifyTrack2Promise, spotifyTrack3Promise, spotifyTrack4Promise, spotifyTrack5Promise, spotifyTrack6Promise, spotifyTrack7Promise, spotifyTrack8Promise, spotifyTrack9Promise])
    if (!spotifyTrack1.success || !spotifyTrack2.success || !spotifyTrack3.success || !spotifyTrack4.success || !spotifyTrack5.success || !spotifyTrack6.success || !spotifyTrack7.success || !spotifyTrack8.success || !spotifyTrack9.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível resgatar as músicas no Spotify, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }

    const imgCollage = await this.msImgFabricApi.get3x3Collage({
      item1: {
        url: spotifyTrack1.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[0].name,
        description: userTopTracksList[0].playcount + ' Scrobbles'
      },
      item2: {
        url: spotifyTrack2.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[1].name,
        description: userTopTracksList[1].playcount + ' Scrobbles'
      },
      item3: {
        url: spotifyTrack3.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[2].name,
        description: userTopTracksList[2].playcount + ' Scrobbles'
      },
      item4: {
        url: spotifyTrack4.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[3].name,
        description: userTopTracksList[3].playcount + ' Scrobbles'
      },
      item5: {
        url: spotifyTrack5.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[4].name,
        description: userTopTracksList[4].playcount + ' Scrobbles'
      },
      item6: {
        url: spotifyTrack6.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[5].name,
        description: userTopTracksList[5].playcount + ' Scrobbles'
      },
      item7: {
        url: spotifyTrack7.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[6].name,
        description: userTopTracksList[6].playcount + ' Scrobbles'
      },
      item8: {
        url: spotifyTrack8.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[7].name,
        description: userTopTracksList[7].playcount + ' Scrobbles'
      },
      item9: {
        url: spotifyTrack9.data.album?.images[0].url ?? config.melodyScout.trackImgUrl,
        name: userTopTracksList[8].name,
        description: userTopTracksList[8].playcount + ' Scrobbles'
      }
    })
    if (!imgCollage.success) {
      void this.ctxFunctions.reply(ctx, 'Não foi possível gerar sua colagem, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
      return
    }

    const collageKeyboard = new InlineKeyboard()
      .url('[1️⃣]', spotifyTrack1.data.externalURL.spotify)
      .url('[2️⃣]', spotifyTrack2.data.externalURL.spotify)
      .url('[3️⃣]', spotifyTrack3.data.externalURL.spotify)
      .row()
      .url('[4️⃣]', spotifyTrack4.data.externalURL.spotify)
      .url('[5️⃣]', spotifyTrack5.data.externalURL.spotify)
      .url('[6️⃣]', spotifyTrack6.data.externalURL.spotify)
      .row()
      .url('[7️⃣]', spotifyTrack7.data.externalURL.spotify)
      .url('[8️⃣]', spotifyTrack8.data.externalURL.spotify)
      .url('[9️⃣]', spotifyTrack9.data.externalURL.spotify)
    await this.ctxFunctions.replyWithPhoto(ctx, new InputFile(imgCollage.data.image, 'teste.png'), {
      caption: '<b>[🖼] Top 9 músicas mais tocadas</b>\n\n[FUNÇÃO EM DESENVOLVIMENTO]',
      parse_mode: 'HTML',
      reply_markup: collageKeyboard
    })
  }
}
