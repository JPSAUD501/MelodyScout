import { Composer, type Context, type InlineQueryContext } from 'grammy'
import { msPrismaDbApi } from '../../bot'
import { runDefaultInline } from '../../botFunctions/inlines/default'
import { logNewInlineQuery } from '../../logFunctions'

export const inlineDefault = new Composer()

inlineDefault.on('inline_query', async (ctx) => {
  logNewInlineQuery(ctx as InlineQueryContext<Context>)
  void runDefaultInline(msPrismaDbApi, ctx as InlineQueryContext<Context>)
})

inlineDefault.errorBoundary((err) => {
  console.error(`Error occurred in inlineDefault: ${String(err)}`)
})
