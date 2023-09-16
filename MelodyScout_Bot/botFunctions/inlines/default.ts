import { Context, InlineQueryContext } from 'grammy'
import { ctxAnswerInlineQuery } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { InlineQueryResultArticle } from 'grammy/types'
import { playingnowInlineResult } from './defaultResults/playingnow'
import { briefInlineResult } from './defaultResults/brief'
import { pnartistInlineResult } from './defaultResults/pnartist'

export async function runDefaultInline (msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: InlineQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const inlineQueryResults: InlineQueryResultArticle[] = []
  const inlinePlayingnowResultPromise = playingnowInlineResult(ctxLang, msMusicApi, msPrismaDbApi, ctx)
  const inlineBriefResultPromise = briefInlineResult(ctxLang, msPrismaDbApi, ctx)
  const inlinePnartistResultPromise = pnartistInlineResult(ctxLang, msMusicApi, msPrismaDbApi, ctx)
  const inlineResults = await Promise.all([inlinePlayingnowResultPromise, inlineBriefResultPromise, inlinePnartistResultPromise])
  inlineQueryResults.push(...inlineResults)

  await ctxAnswerInlineQuery(ctx, inlineQueryResults, { cache_time: 10 })
}
