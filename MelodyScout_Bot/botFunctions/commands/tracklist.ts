import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'
import { PrismaDB } from '../../../function/prismaDB/base'

export class TracklistCommand {
  private readonly ctxFunctions: CtxFunctions
  private readonly prismaDB: PrismaDB

  constructor (ctxFunctions: CtxFunctions, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions
    this.prismaDB = prismaDB
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    if (ctx.chat?.type === 'private') return await this.ctxFunctions.reply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
    await this.ctxFunctions.reply(ctx, 'Estou verificando a lista de perfis que estão sendo rastreados nesse grupo...')
    const trackerChatDBResponse = await this.prismaDB.get.trackerChat(ctx.chat.id.toString())
    if (!trackerChatDBResponse.success) return await this.ctxFunctions.reply(ctx, 'Ops! Parece que eu não consegui recuperar a lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!')
    if (trackerChatDBResponse.trackingUsers.length === 0) return await this.ctxFunctions.reply(ctx, 'Parece que ninguém está sendo rastreado nesse grupo! Para começar a rastrear um perfil, envie o comando /track junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/track MelodyScout</code>')
    await this.ctxFunctions.reply(ctx, `Aqui está a lista de perfis que estão sendo rastreados nesse grupo: <code>${trackerChatDBResponse.trackingUsers.join(', ')}</code>`)
  }
}
