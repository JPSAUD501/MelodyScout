import { Composer } from 'grammy'
import { logNewInlineQuery } from '../../logFunctions'
import { runTracksearchInline } from '../../botFunctions/inlines/tracksearch'

export const tracksearchInline = new Composer()

tracksearchInline.inlineQuery(/.{1,}/, async (ctx) => {
  logNewInlineQuery(ctx)
  void runTracksearchInline(ctx)
})

tracksearchInline.errorBoundary((err) => {
  console.error(`Error occurred in tracksearchInline: ${String(err)}`)
})
