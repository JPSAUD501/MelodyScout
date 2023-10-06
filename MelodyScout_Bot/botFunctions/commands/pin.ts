import { type CommandContext, type Context, InlineKeyboard } from 'grammy'
import { ctxPinMessage, ctxReply } from '../../../function/grammyFunctions'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getPinText } from '../../textFabric/pin'

export async function runPinCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text(lang(ctxLang, 'playingNowButton'), 'PLAYINGNOW')
  const messageToPin = await ctxReply(ctx, undefined, `<a href="${melodyScoutConfig.logoImgUrl}">️️</a>${getPinText(ctxLang)}`, { reply_markup: inlineKeyboard })
  if (messageToPin === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, 'errorSendingMessage'))
    return
  }
  await ctxPinMessage(ctx, messageToPin)
}
