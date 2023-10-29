import { type Context, InlineKeyboard, type InlineQueryContext, InlineQueryResultBuilder } from 'grammy'
import { ctxAnswerInlineQuery } from '../../../functions/grammyFunctions'

import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { type InlineQueryResult } from 'grammy/types'
import { playingnowInlineResult } from './defaultResults/playingnow'
import { briefInlineResult } from './defaultResults/brief'
import { lang } from '../../../translations/base'
import { melodyScoutConfig } from '../../../config'

export async function runDefaultInline (msPrismaDbApi: MsPrismaDbApi, ctx: InlineQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const telegramUserId = ctx.from?.id
  const defaultErrorInlineKeyboard = new InlineKeyboard()
  defaultErrorInlineKeyboard.url('Corrigir erro no MelodyScout!', `https://t.me/${ctx.me.username}?start=start`)
  if (telegramUserId === undefined) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 5 })
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, { key: 'lastfmUserNotRegistered', value: 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, { key: 'lastfmUserNotRegistered', value: 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, { key: 'lastfmUserNoMoreRegisteredError', value: 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, { key: 'lastfmUserNoMoreRegisteredError', value: 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const inlineQueryResults: InlineQueryResult[] = []
  const inlinePlayingnowResultPromise = playingnowInlineResult(ctxLang, lastfmUser, ctx)
  const inlineBriefResultPromise = briefInlineResult(ctxLang, lastfmUser)
  // const inlinePnartistResultPromise = pnartistInlineResult(ctxLang, lastfmUser, msPrismaDbApi, ctx)
  const inlineResults = await Promise.all([inlinePlayingnowResultPromise, inlineBriefResultPromise])
  for (const inlineResult of inlineResults) {
    inlineQueryResults.push(inlineResult.result)
  }

  await ctxAnswerInlineQuery(ctx, inlineQueryResults, { cache_time: 5 })
}
