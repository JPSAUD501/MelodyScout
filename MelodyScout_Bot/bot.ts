import config from './config';
import { Bot, CommandContext, Context } from 'grammy'
import { AdvConsole } from '../functions/advancedConsole';
import { PrismaDB } from '../functions/prismaDB';
import { MsLastfmApi } from '../api/msLastfmApi/base';
import { MsAuth } from '../functions/msAuth';

export class MelodyScoutBot {
  advConsole: AdvConsole;
  bot: Bot
  msLastfmApi: MsLastfmApi;
  prismaDB: PrismaDB;

  constructor(advConsole: AdvConsole, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB) {
    this.advConsole = advConsole;
    this.msLastfmApi = msLastfmApi;
    this.prismaDB = prismaDB;
    this.bot = new Bot(config.telegram.token);

    console.log(`MelodyScout_Bot - Loaded`);
  }

  async start() {
    this.bot.start().catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${err}`);
    });

    this.advConsole.log(`MelodyScout_Bot - Started`);
  }

  private async ctxReply(ctx: CommandContext<Context>, message: string) {
    await ctx.reply(message, { parse_mode: 'HTML' }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${err}`);
    });
  }

  async hear() {
    this.bot.command("start", async (ctx) => {
      await this.ctxReply(ctx, 'Oi, eu sou o MelodyScout, e estou aqui rastrear perfis no Last.fm!');
      if (ctx.chat?.type === 'channel') return await this.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
      if (ctx.chat?.type === 'private') return await this.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!');
      await this.ctxReply(ctx, 'Que legal fazer parte desse grupo com vocês! Espero que gostem de mim! Bom, vamos lá!\n\nPrimeiramente eu gostaria de saber quais são os perfis do Last.fm que eu devo rastrear, para isso você deve me enviar os nomes de usuário dos perfis que você deseja que eu rastreie nesse grupo. Para isso basta enviar o comando /track junto com o nome de usuário do perfil que você deseja adicionar a milha lista de rastreio.\n\nPor exemplo: <code>/track MelodyScout</code>');
      await this.ctxReply(ctx, 'Aproveitando a oportunidade, você pode me enviar o comando /help para saber mais sobre os comandos que eu possuo!');
    });

    this.bot.command("help", async (ctx) => {
      if (ctx.chat?.type === 'channel') return await this.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
      if (ctx.chat?.type === 'private') return await this.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!');
      await this.ctxReply(ctx, 'Opa! Você encontrou um comando que ainda está em desenvolvimento! Por favor, aguarde novas atualizações para saber quando esse comando estará disponível!');
    });

    this.bot.command("track", async (ctx) => {
      if (ctx.chat?.type === 'channel') return await this.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
      if (ctx.chat?.type === 'private') return await this.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!');
      await this.ctxReply(ctx, 'Ai sim! Mais um perfil para eu rastrear! Deixa só eu verificar alguns detalhes...');
      const message: string[] = ctx.message?.text?.split(' ') || [];
      if (message.length < 2) return await this.ctxReply(ctx, 'Ops! Parece que você não me enviou o nome de usuário do perfil que você deseja que eu rastreie! Por favor, envie o comando /track junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/track MelodyScout</code>');
      const username: string = message[1];
      const trackListFromChat = await this.prismaDB.getTrackListFromChat(ctx.chat.id.toString());
      if (!trackListFromChat.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar a lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      if (trackListFromChat.result.find((user) => user === username)) return await this.ctxReply(ctx, 'Parece que esse perfil já está sendo rastreado nesse grupo! Por favor, verifique se você digitou o nome de usuário corretamente e tente novamente! Caso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      const userExists = await this.msLastfmApi.checkIfUserExists(username);
      if (!userExists.success) return await this.ctxReply(ctx, 'Sinto muito, infelizmente eu não consegui verificar se o perfil que você me enviou existe ou não! Por favor, tente novamente mais tarde! Caso esse erro persista, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      if (!userExists.exists) return await this.ctxReply(ctx, 'Ops! Parece que o perfil que você me enviou não existe ou não é valido! Por favor, verifique se você digitou o nome de usuário corretamente e tente novamente! Caso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      const userAboutMe = await this.msLastfmApi.getUserAboutMe(username);
      if (!userAboutMe.success) return await this.ctxReply(ctx, 'Que raiva, infelizmente eu não consegui verificar se o perfil que você me enviou me autorizou a rastreá-lo! Por favor, tente novamente mais tarde! Caso esse erro persista, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      const lastfmUserAllowedTrackingChatIds = MsAuth.getUserAllowedTrackingChatIds(userAboutMe.aboutMe).includes(`${ctx.chat.id}`);
      if (!lastfmUserAllowedTrackingChatIds) return await this.ctxReply(ctx, `Pela minha politica de privacidade eu preciso ter certeza que você é o dono do perfil ou que o dono do mesmo te autorizou a rastrear ele! Para isso eu preciso que seja adicionado na seção "<code>about me</code>" do perfil no Last.fm o seguinte texto: "<code>T:${ctx.chat.id}</code>"!\n\nApós isso me envie novamente o comando comando /track junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/track MelodyScout</code>\n\nCaso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!`);
      const newUserToTrackInChatResult = await this.prismaDB.addNewUserToTrackInChat(ctx.chat.id.toString(), username);
      if (!newUserToTrackInChatResult.success) return await this.ctxReply(ctx, 'M*rda! Parece que eu não consegui adicionar esse perfil na lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      await this.ctxReply(ctx, `Perfeito! Agora eu estou rastreando o perfil <code>${username}</code> nesse grupo!`);
      await this.ctxReply(ctx, `Para parar de rastrear esse perfil nesse grupo, basta enviar o comando /untrack junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/untrack MelodyScout</code>`);
      await this.ctxReply(ctx, `Para ver a lista de perfis que estão sendo rastreados nesse grupo, envie o comando /tracklist`);
    });

    this.bot.command('untrack', async (ctx) => {
      if (ctx.chat?.type === 'channel') return await this.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
      if (ctx.chat?.type === 'private') return await this.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!');
      await this.ctxReply(ctx, 'Aff! Se você quer mesmo parar de rastrear um perfil ok! Deixa só eu verificar alguns detalhes...');
      const message: string[] = ctx.message?.text?.split(' ') || []
      if (message.length < 2) return await this.ctxReply(ctx, 'Ops! Parece que você não me enviou o nome de usuário do perfil que você quer parar de rastrear! Utilize o comando /untrack junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/untrack MelodyScout</code>');
      const username = message[1];
      const trackListFromChat = await this.prismaDB.getTrackListFromChat(ctx.chat.id.toString());
      if (!trackListFromChat.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar a lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      if (!trackListFromChat.result.find((user) => user === username)) return await this.ctxReply(ctx, 'Parece que esse perfil já não está sendo rastreado nesse grupo! Por favor, verifique se você digitou o nome de usuário corretamente e tente novamente! Caso acredite que esse é algum erro, por favor, entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      const removedUserFromTrackInChat = await this.prismaDB.removeUserFromTrackInChat(ctx.chat.id.toString(), username);
      if (!removedUserFromTrackInChat.success) return await this.ctxReply(ctx, 'Que ódio! Parece que eu não consegui remover esse perfil da lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      await this.ctxReply(ctx, `Prontinho! Agora eu parei de rastrear o perfil <code>${username}</code> nesse grupo!`);
    });

    this.bot.command('tracklist', async (ctx) => {
      if (ctx.chat?.type === 'channel') return await this.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
      if (ctx.chat?.type === 'private') return await this.ctxReply(ctx, 'Tudo é melhor com amigos, não é mesmo? Crie um grupo com seus amigos e me adicione nele, pode ser um grupo ja criado também o importante e me adicionar nele, prometo que eu sou legal! Em seguida utilize o comando /start lá novamente que eu te ajudarei a me configurar!');
      await this.ctxReply(ctx, 'Estou verificando a lista de perfis que estão sendo rastreados nesse grupo...');
      const trackListFromChat = await this.prismaDB.getTrackListFromChat(ctx.chat.id.toString());
      if (!trackListFromChat.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar a lista de perfis que estão sendo rastreados nesse grupo! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      if (trackListFromChat.result.length === 0) return await this.ctxReply(ctx, 'Parece que ninguém está sendo rastreado nesse grupo! Para começar a rastrear um perfil, envie o comando /track junto com o nome de usuário do Last.fm como no exemplo a seguir: <code>/track MelodyScout</code>');
      await this.ctxReply(ctx, `Aqui está a lista de perfis que estão sendo rastreados nesse grupo: <code>${trackListFromChat.result.join(', ')}</code>`);
    });

    this.bot.command('contact', async (ctx) => {
      await this.ctxReply(ctx, 'Para entrar em contato com o desenvolvedor do bot, envie uma mensagem para o @jpsaud501!');
    });

    this.bot.command('myuser', async (ctx) => {
      if (ctx.chat?.type === 'channel') return await this.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
      const telegramUserId = ctx.from?.id.toString();
      if (!telegramUserId) return await this.ctxReply(ctx, 'Estranho! Parece que eu não consegui identificar o seu ID no Telegram! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      const lastfmUserFromTelegramUser = await this.prismaDB.getLastfmUserFromTelegramUser(telegramUserId);
      if (!lastfmUserFromTelegramUser.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      if (lastfmUserFromTelegramUser.registered) return await this.ctxReply(ctx, 'Parece que você já está registrado! Para registrar um novo nome de usuário do Last.fm, envie antes o comando /forgetme para que eu esqueça o seu nome de usuário atual!');
      const message: string[] = ctx.message?.text?.split(' ') || []
      if (message.length < 2) return await this.ctxReply(ctx, 'Ops! Parece que você não me informou o seu nome de usuário do Last.fm! Por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>');
      const username = message[1];
      const userExists = await this.msLastfmApi.checkIfUserExists(username);
      if (!userExists.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui verificar se o seu nome de usuário do Last.fm existe! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      if (!userExists.exists) return await this.ctxReply(ctx, 'Ops! Parece que o nome de usuário do Last.fm que você me informou não existe! Por favor, tente novamente informando um nome de usuário do Last.fm válido!');
      const linkTelegramUserToLastfmUser = await this.prismaDB.linkTelegramUserToLastfmUser(telegramUserId, username);
      if (!linkTelegramUserToLastfmUser.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui registrar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      await this.ctxReply(ctx, 'Pronto! Seu nome de usuário do Last.fm foi registrado com sucesso! Agradeço imensamente por isso e espero que você aproveite o bot!');
    });

    this.bot.command('forgetme', async (ctx) => {
      if (ctx.chat?.type === 'channel') return await this.ctxReply(ctx, 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!');
      const telegramUserId = ctx.from?.id.toString();
      if (!telegramUserId) return await this.ctxReply(ctx, 'Estranho! Parece que eu não consegui identificar o seu ID no Telegram! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      const lastfmUserFromTelegramUser = await this.prismaDB.getLastfmUserFromTelegramUser(telegramUserId);
      if (!lastfmUserFromTelegramUser.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      if (!lastfmUserFromTelegramUser.registered) return await this.ctxReply(ctx, 'Parece que você ainda não está registrado! Para registrar um nome de usuário do Last.fm, envie o comando /myuser junto com o seu nome de usuário como no exemplo a seguir: <code>/myuser MelodyScout</code>');
      const unlinkTelegramUserFromLastfmUser = await this.prismaDB.unlinkTelegramUserFromLastfmUser(telegramUserId);
      if (!unlinkTelegramUserFromLastfmUser.success) return await this.ctxReply(ctx, 'Ops! Parece que eu não consegui esquecer o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!');
      await this.ctxReply(ctx, 'Pronto! Eu esqueci o seu nome de usuário do Last.fm!');
    });

    this.advConsole.log(`MelodyScout_Bot - Listening`);
  }
}