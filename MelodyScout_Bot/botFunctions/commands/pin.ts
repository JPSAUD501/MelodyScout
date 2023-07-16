import { CommandContext, Context, InlineKeyboard } from 'grammy'
import { ctxPinMessage, ctxReply } from '../../../function/grammyFunctions'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'

export async function runPinCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text(lang(ctxLang, 'playingNowButton'), 'PLAYINGNOW')
  const messageToPin = await ctxReply(ctx, `<a href="${melodyScoutConfig.logoImgUrl}">️️</a>${lang(ctxLang, 'whatAreYouListeningNowPinMessage')}`, { reply_markup: inlineKeyboard })
  if (messageToPin === undefined) {
    void ctxReply(ctx, lang(ctxLang, 'errorSendingMessage'))
    return
  }
  await ctxPinMessage(ctx, messageToPin)
}
