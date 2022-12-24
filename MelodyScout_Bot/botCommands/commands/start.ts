import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'

export class StartCommand {
  private readonly ctxFunctions: CtxFunctions

  constructor (ctxFunctions: CtxFunctions) {
    this.ctxFunctions = ctxFunctions
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    await this.ctxFunctions.ctxReply(ctx, 'Oi, eu sou o MelodyScout, e estou aqui rastrear perfis no Last.fm!')
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
    if (ctx.chat?.type === 'private') return await this.ctxFunctions.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
    await this.ctxFunctions.ctxReply(ctx, 'Que legal fazer parte desse grupo com vocês! Espero que gostem de mim! Bom, vamos lá!\n\nPrimeiramente eu gostaria de saber quais são os perfis do Last.fm que eu devo rastrear, para isso você deve me enviar os nomes de usuário dos perfis que você deseja que eu rastreie nesse grupo. Para isso basta enviar o comando /track junto com o nome de usuário do perfil que você deseja adicionar a milha lista de rastreio.\n\nPor exemplo: <code>/track MelodyScout</code>')
    await this.ctxFunctions.ctxReply(ctx, 'Aproveitando a oportunidade, você pode me enviar o comando /help para saber mais sobre os comandos que eu possuo!')
  }
}
