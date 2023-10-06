import { Composer } from "grammy"
import { msMusicApi, msPrismaDbApi } from "../../bot"
import { runDefaultInline } from "../../botFunctions/inlines/default"
import { logNewInlineQuery } from "../../logFunctions"

export const inlineDefault = new Composer()

inlineDefault.on('inline_query', async (ctx) => {
  logNewInlineQuery(ctx)
  void runDefaultInline(msMusicApi, msPrismaDbApi, ctx)
})