import { Composer } from 'grammy'
import { msMusicApi, msPrismaDbApi } from '../../bot'
import { runDefaultInline } from '../../botFunctions/inlines/default'
import { logNewInlineQuery } from '../../logFunctions'

export const inlineDefault = new Composer()

inlineDefault.on('inline_query', async (ctx) => {
  logNewInlineQuery(ctx)
  void runDefaultInline(msMusicApi, msPrismaDbApi, ctx)
})

inlineDefault.errorBoundary((err) => {
  console.error(`Error occurred in inlineDefault: ${String(err)}`)
})
