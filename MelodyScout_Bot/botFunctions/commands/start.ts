import { CommandContext, Context } from 'grammy'
import { CtxFunctions } from '../../../function/ctxFunctions'

export class StartCommand {
  private readonly ctxFunctions: CtxFunctions

  constructor (ctxFunctions: CtxFunctions) {
    this.ctxFunctions = ctxFunctions
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    await this.ctxFunctions.reply(ctx, 'Oi, eu sou o MelodyScout, e estou aqui rastrear perfis no Last.fm!')
    if (ctx.chat?.type === 'channel') {
      void this.ctxFunctions.reply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!')
      return
    }
    if (ctx.chat?.type === 'private') {
      void this.ctxFunctions.reply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!')
      return
    }
    await this.ctxFunctions.reply(ctx, 'Que legal fazer parte desse grupo com vocês! Espero que gostem de mim! Bom, vamos lá!\n\nUtilize o comando <code>/myuser</code> para definir seu nome de usuário do Last.fm!\n\nPor exemplo: <code>/myuser MelodyScout</code>')
    await this.ctxFunctions.reply(ctx, 'Aproveitando a oportunidade, você pode me enviar o comando /help para saber mais sobre os comandos que eu possuo!')
  }
}
