import { type CommandContext, type Context } from 'grammy'
import { ctxReply } from '../../../functions/grammyFunctions'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'

export async function runAllusersCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return
  }
  const ctxFromId = ctx.from?.id
  if (ctxFromId === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }))
    return
  }
  if (!melodyScoutConfig.admins.includes(ctxFromId.toString())) return
  const allUsers = await msPrismaDbApi.get.allTelegramUsers()
  if (!allUsers.success) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetAllUsersFromDatabaseErrorMessage', value: 'Infelizmente não foi possível recuperar os usuários do banco de dados, por favor tente novamente mais tarde!' }))
    return
  }
  const personsEmojis = ['🧑', '🧔', '🧓', '🧕', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '👨', '👩', '👱', '👴', '👵', '👲', '👳', '👮', '👷', '💂', '🕵', '👼', '🎅', '👸', '🤴', '👰', '🤵']
  const allUsersStringArray: string[] = []
  for (let i = 0; i < allUsers.telegramUsers.length; i++) {
    const user = allUsers.telegramUsers[i]
    allUsersStringArray.push(lang(ctxLang, { key: 'allUsersListUserMessagePart', value: '<b>[{{userEmoji}}]<code> {{userLastfmName}}</code>:</b>\n- TelegramID: <code>{{userTelegramId}}</code>\n- LastUpdate: <code>{{userLastUpdate}}</code>' }, { userEmoji: personsEmojis[parseInt(user.telegramUserId) % personsEmojis.length], userLastfmName: user.lastfmUser ?? 'Unsubscribed', userTelegramId: user.telegramUserId, userLastUpdate: user.lastUpdate }))
    allUsersStringArray.push('\n')
  }
  const finalMessage = [lang(ctxLang, { key: 'allUsersListHeaderMessage', value: '<b>[🗃] Lista de usuários:</b>\n- Total de usuários: <code>{{userCount}}</code>' }, { userCount: allUsers.telegramUsers.length }), '\n', ...allUsersStringArray]
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
