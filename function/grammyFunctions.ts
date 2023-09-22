import { CallbackQueryContext, Context, InputFile, RawApi } from 'grammy'
import { advError } from './advancedConsole'
import { Message } from '@grammyjs/types'
import { Other } from 'grammy/out/core/api'
import { lang } from '../translations/base'
import { InlineQueryResult } from 'grammy/types'

export async function ctxReply (ctx: Context, message: string, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<Message.TextMessage | undefined> {
  const ctxLang = ctx.from?.language_code
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  if (message.length > 4096) {
    advError('MelodyScout_Bot - Error: message length is greater than 4096')
    await ctxReply(ctx, lang(ctxLang, 'messageLengthGreater4096ErrorMessage'))
    return
  }
  const sendedMessage = await ctx.api.sendMessage(ctxChatId, message, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
    advError(`MelodyScout_Bot - In Reply: ${message}`)
    return undefined
  })
  if (sendedMessage === undefined) {
    advError('MelodyScout_Bot - Error: sendedMessage is undefined')
    return undefined
  }
  return sendedMessage
}

export async function ctxAnswerInlineQuery (ctx: Context, results: readonly InlineQueryResult[], options?: Other<RawApi, 'answerInlineQuery', 'inline_query_id' | 'results'>): Promise<void> {
  if (ctx.inlineQuery === undefined) {
    advError('MelodyScout_Bot - Error: ctx.inlineQuery is undefined')
    return
  }
  const answerInlineQuery = await ctx.api.answerInlineQuery(ctx.inlineQuery.id, results, {
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (answerInlineQuery === undefined) {
    advError('MelodyScout_Bot - Error: answerInlineQuery is undefined')
    return undefined
  }
  return undefined
}

export async function ctxPinMessage (ctx: Context, message: Message): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const pinedMessage = await ctx.api.pinChatMessage(message.chat.id, message.message_id).catch((_err) => {
    advError(`MelodyScout_Bot - Error: ${String(_err)}`)
    return undefined
  })
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return
  }
  if (pinedMessage === undefined) {
    if (message.chat === undefined) return
    const alertMessage = await ctxReply(ctx, lang(ctxLang, 'cantPinMessageErrorMessage'))
    if (alertMessage === undefined) {
      advError('MelodyScout_Bot - Error: alertMessage is undefined')
      return
    }
    setTimeout(() => {
      if (ctxChatId === undefined) {
        advError('MelodyScout_Bot - Error: ctxChatId is undefined')
        return
      }
      void ctx.api.deleteMessage(ctxChatId, alertMessage.message_id).catch((err) => {
        advError(`MelodyScout_Bot - Error: ${String(err)}`)
      })
    }, 15000)
  }
}

export async function ctxEditMessage (ctx: Context, messageToEdit: { chatId: number, messageId: number } | undefined, text: string, options?: Other<RawApi, 'editMessageText', 'text' | 'chat_id' | 'message_id'>): Promise<Message.TextMessage | undefined> {
  const ctxLang = ctx.from?.language_code
  const ctxChatId = messageToEdit?.chatId ?? ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  if (text.length > 4096) {
    advError('MelodyScout_Bot - Error: text length is greater than 4096')
    await ctxReply(ctx, lang(ctxLang, 'messageLengthGreater4096ErrorMessage'))
    return undefined
  }
  const editMessageId = messageToEdit?.messageId ?? ctx.message?.message_id ?? ctx.update.callback_query?.message?.message_id
  if (editMessageId === undefined) {
    advError('MelodyScout_Bot - Error: editMessageId is undefined')
    return undefined
  }
  const editedMessage = await ctx.api.editMessageText(ctxChatId, editMessageId, text, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (editedMessage === undefined) {
    advError('MelodyScout_Bot - Error: editedMessage is undefined')
    return undefined
  }
  if (editedMessage === true) {
    advError('MelodyScout_Bot - Error: editedMessage is true')
    return undefined
  }
  return editedMessage
}

export async function ctxTempReply (ctx: Context, message: string, timeout: number, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<Message.TextMessage | undefined> {
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  const sendedMessage = await ctx.api.sendMessage(ctxChatId, message, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
    advError(`MelodyScout_Bot - In Reply: ${message}`)
    return undefined
  })
  if (sendedMessage === undefined) {
    advError('MelodyScout_Bot - Error: sendedMessage is undefined')
    return undefined
  }
  setTimeout(() => {
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return
    }
    void ctx.api.deleteMessage(ctxChatId, sendedMessage.message_id).catch(() => {
      advError('MelodyScout_Bot - Error: Failed to delete loading message')
    })
  }, timeout)
  return sendedMessage
}

export async function ctxAnswerCallbackQuery (ctx: CallbackQueryContext<Context>, message?: string): Promise<void> {
  await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
    text: message
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
}

export async function ctxReplyWithVoice (ctx: Context, audio: string | InputFile, options?: Other<RawApi, 'sendVoice', 'chat_id' | 'voice'>): Promise<Message.VoiceMessage | undefined> {
  const ctxLang = ctx.from?.language_code
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, lang(ctxLang, 'messageLengthGreater1024ErrorMessage'))
    return
  }
  const loadingMessage = await ctxReply(ctx, lang(ctxLang, 'sendingVoiceMessage'), {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const voiceMessage = await ctx.api.sendVoice(ctxChatId, audio, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (voiceMessage === undefined) {
    advError('MelodyScout_Bot - Error: voiceMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctxChatId, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return voiceMessage
}

export async function ctxReplyWithAudio (ctx: Context, audio: string | InputFile, options?: Other<RawApi, 'sendAudio', 'audio' | 'chat_id'>): Promise<Message.AudioMessage | undefined> {
  const ctxLang = ctx.from?.language_code
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, lang(ctxLang, 'messageLengthGreater1024ErrorMessage'))
    return
  }
  const loadingMessage = await ctxReply(ctx, lang(ctxLang, 'sendingAudioMessage'), {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const audioMessage = await ctx.api.sendAudio(ctxChatId, audio, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (audioMessage === undefined) {
    advError('MelodyScout_Bot - Error: audioMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctxChatId, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return audioMessage
}

export async function ctxReplyWithVideo (ctx: Context, video: string | InputFile, options?: Other<RawApi, 'sendVideo', 'chat_id' | 'video'>): Promise<Message.VideoMessage | undefined> {
  const ctxLang = ctx.from?.language_code
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, lang(ctxLang, 'messageLengthGreater1024ErrorMessage'))
    return
  }
  const loadingMessage = await ctxReply(ctx, lang(ctxLang, 'sendingVideoMessage'), {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const videoMessage = await ctx.api.sendVideo(ctxChatId, video, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (videoMessage === undefined) {
    advError('MelodyScout_Bot - Error: videoMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctxChatId, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return videoMessage
}

export async function ctxReplyWithDocument (ctx: Context, file: string | InputFile, options?: Other<RawApi, 'sendDocument', 'chat_id' | 'document'>): Promise<Message.DocumentMessage | undefined> {
  const ctxLang = ctx.from?.language_code
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, lang(ctxLang, 'messageLengthGreater1024ErrorMessage'))
    return
  }
  const loadingMessage = await ctxReply(ctx, lang(ctxLang, 'sendingDocumentMessage'), {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const documentMessage = await ctx.api.sendDocument(ctxChatId, file, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (documentMessage === undefined) {
    advError('MelodyScout_Bot - Error: documentMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctxChatId, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return documentMessage
}

export async function ctxReplyWithPhoto (ctx: Context, photo: string | InputFile, options?: Other<RawApi, 'sendPhoto', 'chat_id' | 'photo'>): Promise<Message.PhotoMessage | undefined> {
  const ctxLang = ctx.from?.language_code
  const ctxChatId = ctx.chat?.id ?? ctx.from?.id
  if (ctxChatId === undefined) {
    advError('MelodyScout_Bot - Error: ctxChatId is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, lang(ctxLang, 'messageLengthGreater1024ErrorMessage'))
    return
  }
  const loadingMessage = await ctxReply(ctx, lang(ctxLang, 'sendingPhotoMessage'), {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const photoMessage = await ctx.api.sendPhoto(ctxChatId, photo, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (photoMessage === undefined) {
    advError('MelodyScout_Bot - Error: photoMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctxChatId, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return photoMessage
}
