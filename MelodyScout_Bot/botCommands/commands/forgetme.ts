import { CommandContext, Context } from "grammy";
import { CtxFunctions } from "../../../functions/ctxFunctions";
import { PrismaDB } from "../../../functions/prismaDB/base";
import { MsLastfmApi } from "../../../api/msLastfmApi/base";

export class ForgetmeCommand {
  private ctxFunctions: CtxFunctions;
  private prismaDB: PrismaDB;

  constructor (ctxFunctions: CtxFunctions, prismaDB: PrismaDB) {
    this.ctxFunctions = ctxFunctions;
    this.prismaDB = prismaDB;
  }

  async run (ctx: CommandContext<Context>): Promise<void> {
    if (ctx.chat?.type === 'channel') return await this.ctxFunctions.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
    const telegramUserId = ctx.from?.id.toString();
    if (!telegramUserId) return await this.ctxFunctions.ctxReply(ctx, 'Estranho! Parece que eu não consegui identificar o seu ID no Telegram! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    const telegramUserDBResponse = await this.prismaDB.get.telegramUser(telegramUserId);
    if (!telegramUserDBResponse.success) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    if (!telegramUserDBResponse.lastfmUser) return await this.ctxFunctions.ctxReply(ctx, 'Parece que você ainda não está registrado! Para registrar um nome de usuário do Last.fm, envie o comando /myuser junto com o seu nome de usuário como no exemplo a seguir: <code>/myuser MelodyScout</code>');
    const updatedTelegramUserDBResponse = await this.prismaDB.update.telegramUser(telegramUserId, null);
    if (!updatedTelegramUserDBResponse.success) return await this.ctxFunctions.ctxReply(ctx, 'Ops! Parece que eu não consegui esquecer o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
    await this.ctxFunctions.ctxReply(ctx, 'Pronto! Eu esqueci o seu nome de usuário do Last.fm!');
  }
}