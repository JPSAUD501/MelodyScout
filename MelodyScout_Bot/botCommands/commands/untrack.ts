import { CommandContext, Context } from "grammy";
import { CtxFunctions } from "../../../functions/ctxFunctions";
import { PrismaDB } from "../../../functions/prismaDB/base";

export class UntrackCommand {
  private ctxFunctions: CtxFunctions;
  private prismaDB: PrismaDB;

  constructor (ctxFunctions: CtxFunctions, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions;
    this.prismaDB = prismaDB;
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
    if (ctx.chat?.type === 'private') return await this.ctxFunctions.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!');
    await this.ctxFunctions.ctxReply(ctx, 'Aff! Se você quer mesmo parar de rastrear um perfil ok! Deixa só eu verificar alguns detalhes...');
    const message: string[] = ctx.message?.text?.split(' ') || []
    if (message.length < 2) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que você não me enviou o nome de usuário do perfil que você quer parar de rastrear! Utilize o comando /untrack junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/untrack MelodyScout</code>');
    const username = message[1];
    const trackerChatDBResponse = await this.prismaDB.get.trackerChat(ctx.chat.id.toString());
    if (!trackerChatDBResponse.success) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar a lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    if (!trackerChatDBResponse.trackingUsers.find((user) => user === username)) return await this.ctxFunctions.ctxReply(ctx, 'Parece que esse perfil já não está sendo rastreado nesse grupo! Por favor, verifique se você digitou o nome de usuário corretamente e tente novamente! Caso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    const removedUserFromTrackInChat = await this.prismaDB.update.trackerChat(ctx.chat.id.toString(), [username], 'remove');
    if (!removedUserFromTrackInChat.success) return await this.ctxFunctions.ctxReply(ctx, 'Que ódio! Parece que eu não consegui remover esse perfil da lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    await this.ctxFunctions.ctxReply(ctx, `Prontinho! Agora eu parei de rastrear o perfil <code>${username}</code> nesse grupo!`);
  }
}