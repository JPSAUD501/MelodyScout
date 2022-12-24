import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { PrismaDB } from '../../../function/prismaDB/base'
import { getUserAllowedTrackingChatIds } from '../../../function/msAuth'

export class TrackCommand {
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
    await this.ctxFunctions.ctxReply(ctx, 'Ai sim! Mais um perfil para eu rastrear! Deixa só eu verificar alguns detalhes...')
    const message = ((ctx.message?.text?.split(' ')) != null) ? ctx.message?.text?.split(' ') : []
    if (message.length < 2) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que você não me enviou o nome de usuário do perfil que você deseja que eu rastreie! Por favor, envie o comando /track junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/track MelodyScout</code>')
    const username: string = message[1]
    const trackerChatDBResponse = await this.prismaDB.get.trackerChat(ctx.chat?.id.toString())
    if (!trackerChatDBResponse.success) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar a lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    if (trackerChatDBResponse.trackingUsers.find((user) => user === username) != null) return await this.ctxFunctions.ctxReply(ctx, 'Parece que esse perfil já está sendo rastreado nesse grupo! Por favor, verifique se você digitou o nome de usuário corretamente e tente novamente! Caso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    const userExists = await this.msLastfmApi.checkIfUserExists(username)
    if (!userExists.success) return await this.ctxFunctions.ctxReply(ctx, 'Sinto muito, infelizmente eu não consegui verificar se o perfil que você me enviou existe ou não! Por favor, tente novamente mais tarde! Caso esse erro persista, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    if (!userExists.exists) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que o perfil que você me enviou não existe ou não é valido! Por favor, verifique se você digitou o nome de usuário corretamente e tente novamente! Caso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    const userAboutMe = await this.msLastfmApi.getUserAboutMe(username)
    if (!userAboutMe.success) return await this.ctxFunctions.ctxReply(ctx, 'Que raiva, infelizmente eu não consegui verificar se o perfil que você me enviou me autorizou a rastreá-lo! Por favor, tente novamente mais tarde! Caso esse erro persista, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    const lastfmUserAllowedTrackingChatIds = getUserAllowedTrackingChatIds(userAboutMe.aboutMe).includes(`${ctx.chat.id}`)
    if (!lastfmUserAllowedTrackingChatIds) return await this.ctxFunctions.ctxReply(ctx, `Pela minha politica de privacidade eu preciso ter certeza que você é o dono do perfil ou que o dono do mesmo te autorizou a rastrear ele! Para isso eu preciso que seja adicionado na seção "<code>about me</code>" do perfil no Last.fm o seguinte texto: "<code>T:${ctx.chat.id}</code>"!\n\nApós isso me envie novamente o comando comando /track junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/track MelodyScout</code>\n\nCaso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!`)
    const newUserToTrackInChatResult = await this.prismaDB.update.trackerChat(ctx.chat.id.toString(), [username], 'add')
    if (!newUserToTrackInChatResult.success) return await this.ctxFunctions.ctxReply(ctx, 'M*rda! Parece que eu não consegui adicionar esse perfil na lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    await this.ctxFunctions.ctxReply(ctx, `Perfeito! Agora eu estou rastreando o perfil <code>${username}</code> nesse grupo!`)
    await this.ctxFunctions.ctxReply(ctx, 'Para parar de rastrear esse perfil nesse grupo, basta enviar o comando /untrack junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/untrack MelodyScout</code>')
    await this.ctxFunctions.ctxReply(ctx, 'Para ver a lista de perfis que estão sendo rastreados nesse grupo, envie o comando /tracklist')
  }
}
