import { CommandContext, Context } from "grammy";
import { CtxFunctions } from "../../../functions/ctxFunctions";

export class HelpCommand {
  private ctxFunctions: CtxFunctions;

  constructor (ctxFunctions: CtxFunctions) {
    this.ctxFunctions = ctxFunctions;
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
    if (ctx.chat?.type === 'private') return await this.ctxFunctions.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!');
    await this.ctxFunctions.ctxReply(ctx, 'Opa! Você encontrou um comando que ainda está em desenvolvimento! Por favor, aguarde novas atualizações para saber quando esse comando estará disponível!');
  }
}