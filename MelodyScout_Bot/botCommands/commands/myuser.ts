import { CommandContext, Context } from "grammy";
import { CtxFunctions } from "../../../functions/ctxFunctions";
import { PrismaDB } from "../../../functions/prismaDB/base";
import { MsLastfmApi } from "../../../api/msLastfmApi/base";

export class MyuserCommand {
  private ctxFunctions: CtxFunctions;
  private msLastfmApi: MsLastfmApi;
  private prismaDB: PrismaDB;

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions;
    this.msLastfmApi = msLastfmApi;
    this.prismaDB = prismaDB;
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
    if (!ctx.from?.id) return await this.ctxFunctions.ctxReply(ctx, 'Estranho! Parece que eu não consegui identificar o seu ID no Telegram! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    const telegramUserId = ctx.from?.id.toString();
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(telegramUserId);
    if (!telegramUserDBResponse.success) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que eu não consegui verificar se você já está cadastrado no MelodyScout! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    if (telegramUserDBResponse.lastfmUser) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que você já está cadastrado no MelodyScout! Por favor, utilize o comando /forgetme para que eu esqueça o seu cadastro no MelodyScout e depois utilize o comando /myuser novamente para cadastrar o seu nome de usuário do Last.fm!');
    const message: string[] = ctx.message?.text?.split(' ') || []
    if (message.length < 2) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que você não me informou o seu nome de usuário do Last.fm! Por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>');
    const username = message[1];
    const userExists = await this.msLastfmApi.checkIfUserExists(username);
    if (!userExists.success) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que eu não consegui verificar se o seu nome de usuário do Last.fm existe! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    if (!userExists.exists) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que o nome de usuário do Last.fm que você me informou não existe! Por favor, tente novamente informando um nome de usuário do Last.fm válido!');
    const updateTelegramUserDBResponse = await this.prismaDB.update.telegramUser(telegramUserId, username)
    if (!updateTelegramUserDBResponse.success) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que eu não consegui registrar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    await this.ctxFunctions.ctxReply(ctx, 'Pronto! Seu nome de usuário do Last.fm foi registrado com sucesso! Agradeço imensamente por isso e espero que você aproveite o bot!');
  }
}