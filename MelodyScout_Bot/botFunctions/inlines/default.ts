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
        description: lang(ctxLang, 'unableToGetUserIdErrorMessage'),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, 'unableToGetUserIdErrorMessage'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 5 })
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'unableToGetUserInfoInDb'),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, 'unableToGetUserInfoInDb'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'lastfmUserNotRegistered'),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, 'lastfmUserNotRegistered'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'unableToGetUserInfoInDb'),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, 'unableToGetUserInfoInDb'), { parse_mode: 'HTML' })
    void ctxAnswerInlineQuery(ctx, [inlineQueryResultError], { cache_time: 0 })
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    const inlineQueryResultError = InlineQueryResultBuilder
      .article('ERROR', 'An error occurred!', {
        description: lang(ctxLang, 'lastfmUserNoMoreRegisteredError'),
        thumbnail_url: melodyScoutConfig.logoImgUrl,
        reply_markup: defaultErrorInlineKeyboard
      })
      .text(lang(ctxLang, 'lastfmUserNoMoreRegisteredError'), { parse_mode: 'HTML' })
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
