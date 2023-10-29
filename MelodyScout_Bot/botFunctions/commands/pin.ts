import { type CommandContext, type Context, InlineKeyboard } from 'grammy'
import { ctxPinMessage, ctxReply } from '../../../functions/grammyFunctions'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getPinText } from '../../textFabric/pin'

export async function runPinCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text(lang(ctxLang, { key: 'playingNowButton', value: 'Tocando Agora' }), 'PLAYINGNOW')
  const messageToPin = await ctxReply(ctx, undefined, `<a href="${melodyScoutConfig.logoImgUrl}">️️</a>${getPinText(ctxLang)}`, { reply_markup: inlineKeyboard })
  if (messageToPin === undefined) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorSendingMessage', value: 'Parece que algo deu errado ao enviar a mensagem, por favor tente novamente!' }))
    return
  }
  await ctxPinMessage(ctx, messageToPin)
}
