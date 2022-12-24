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
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    if (ctx.chat?.type === 'private') return await this.ctxFunctions.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
    const telegramUserId = ctx.from?.id
    if (telegramUserId === undefined) return await this.ctxFunctions.ctxReply(ctx, 'Não foi possível identificar seu usuário no telegram, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(`${telegramUserId}`)
    if (!telegramUserDBResponse.success) return await this.ctxFunctions.ctxReply(ctx, 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    const lastfmUser = telegramUserDBResponse.lastfmUser
    if (lastfmUser === null) return await this.ctxFunctions.ctxReply(ctx, 'Para utilizar esse comando envie antes /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    const userInfo = await this.msLastfmApi.user.getInfo(lastfmUser)
    if (!userInfo.success) return await this.ctxFunctions.ctxReply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact`)
    const userRecentTracks = await this.msLastfmApi.user.getRecentTracks(lastfmUser, 5)
    if (!userRecentTracks.success) return await this.ctxFunctions.ctxReply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact')
    await this.ctxFunctions.ctxReply(ctx, getBriefText(userInfo.data, userRecentTracks.data), undefined, false)
  }
}
