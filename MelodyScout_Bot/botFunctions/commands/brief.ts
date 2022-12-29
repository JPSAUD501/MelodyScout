import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { PrismaDB } from '../../../function/prismaDB/base'
import { getBriefText } from '../../function/textFabric'

export class BriefCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly msLastfmApi: MsLastfmApi
  private readonly prismaDB: PrismaDB

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions
    this.msLastfmApi = msLastfmApi
    this.prismaDB = prismaDB
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
    const userInfoRequest = this.msLastfmApi.user.getInfo(lastfmUser)
    const userRecentTracksRequest = this.msLastfmApi.user.getRecentTracks(lastfmUser, 3)
    const userTopTracksRequest = this.msLastfmApi.user.getTopTracks(lastfmUser, 5)
    const userTopAlbumsRequest = this.msLastfmApi.user.getTopAlbums(lastfmUser, 5)
    const userTopArtistsRequest = this.msLastfmApi.user.getTopArtists(lastfmUser, 5)
    const [userInfo, userRecentTracks, userTopTracks, userTopAlbums, userTopArtists] = await Promise.all([userInfoRequest, userRecentTracksRequest, userTopTracksRequest, userTopAlbumsRequest, userTopArtistsRequest])
    if (!userInfo.success) return await this.ctxFunctions.reply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact`)
    if (!userRecentTracks.success) return await this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    if (!userTopTracks.success) return await this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar as suas músicas mais tocadas do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    if (!userTopAlbums.success) return await this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar os seus álbuns mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    if (!userTopArtists.success) return await this.ctxFunctions.reply(ctx, 'Estranho, não foi possível resgatar os seus artistas mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    await this.ctxFunctions.reply(ctx, getBriefText(userInfo.data, userRecentTracks.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data))
  }
}
