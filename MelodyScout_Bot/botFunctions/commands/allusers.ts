import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'

export async function runAllusersCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const ctxFromId = ctx.from?.id
  if (ctxFromId === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, 'unableToGetUserIdErrorMessage'))
    return
  }
  if (!melodyScoutConfig.admins.includes(ctxFromId.toString())) return
  const allUsers = await msPrismaDbApi.get.allTelegramUsers()
  if (!allUsers.success) {
    await ctxReply(ctx, undefined, lang(ctxLang, 'unableToGetAllUsersFromDatabaseErrorMessage'))
    return
  }
  const personsEmojis = ['🧑', '🧔', '🧓', '🧕', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '👨', '👩', '👱', '👴', '👵', '👲', '👳', '👮', '👷', '💂', '🕵', '👼', '🎅', '👸', '🤴', '👰', '🤵']
  const allUsersStringArray: string[] = []
  for (let i = 0; i < allUsers.telegramUsers.length; i++) {
    const user = allUsers.telegramUsers[i]
    allUsersStringArray.push(lang(ctxLang, 'allUsersListUserMessagePart', { userEmoji: personsEmojis[parseInt(user.telegramUserId) % personsEmojis.length], userLastfmName: user.lastfmUser ?? 'Unsubscribed', userTelegramId: user.telegramUserId, userLastUpdate: user.lastUpdate }))
    allUsersStringArray.push('\n')
  }
  const finalMessage = [lang(ctxLang, 'allUsersListHeaderMessage', { userCount: allUsers.telegramUsers.length }), '\n', ...allUsersStringArray]
  let partialString = ''
  for (let i = 0; i < finalMessage.length; i++) {
    partialString += `${finalMessage[i]}\n`
    if (partialString.length > 4000) {
      await ctxReply(ctx, undefined, partialString)
      partialString = ''
    }
  }
  if (partialString.length > 0) await ctxReply(ctx, undefined, partialString)
}
