import { type CallbackQueryContext, type Context, type InputFile, type RawApi } from 'grammy'
import { advError } from './advancedConsole'
import { type Message } from '@grammyjs/types'
import { type Other } from '../node_modules/grammy/out/core/api'
import { lang } from '../translations/base'
import { type Update, type InlineQueryResult, type ReactionTypeEmoji, type ReactionType } from 'grammy/types'

export async function ctxReply (ctx: Context, messageToSend: { chatId: number } | undefined, message: string, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<Message.TextMessage | undefined> {
  try {
    const ctxLang = ctx.from?.language_code
    const ctxChatId = messageToSend?.chatId ?? ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    if (message.length > 4096) {
      advError('MelodyScout_Bot - Error: message length is greater than 4096')
      await ctxReply(ctx, { chatId: ctxChatId }, lang(ctxLang, { key: 'messageLengthGreater4096ErrorMessage', value: 'Ocorreu um erro ao tentar responder ao seu comando pois por algum motivo a mensagem ficou maior que 4096 caracteres. Nossa equipe já foi notificada e está trabalhando para resolver o problema o mais rápido possível. Desculpe pelo transtorno. Por favor, tente novamente!' }))
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxReact (ctx: Context, reaction: ReactionTypeEmoji['emoji'] | ReactionType): Promise<void> {
  try {
    await ctx.react(reaction).catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxAnswerInlineQuery (ctx: Context, results: readonly InlineQueryResult[], options?: Other<RawApi, 'answerInlineQuery', 'inline_query_id' | 'results'>): Promise<void> {
  try {
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxPinMessage (ctx: Context, message: Message): Promise<void> {
  try {
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
      const alertMessage = await ctxReply(ctx, undefined, lang(ctxLang, { key: 'cantPinMessageErrorMessage', value: '[⚠] Não foi possível fixar a mensagem automaticamente. Caso queira você ainda pode fixa-la manualmente. Para isso, clique na mensagem acima e em seguida em "Fixar".\n\nEssa mensagem de aviso será apagada em 15 segundos.' }))
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxEditMessage (ctx: Context, messageToEdit: { chatId: number, messageId: number } | undefined, text: string, options?: Other<RawApi, 'editMessageText', 'text' | 'chat_id' | 'message_id'>): Promise<Message.TextMessage | undefined> {
  try {
    const ctxLang = ctx.from?.language_code
    const ctxChatId = messageToEdit?.chatId ?? ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    if (text.length > 4096) {
      advError('MelodyScout_Bot - Error: text length is greater than 4096')
      await ctxReply(ctx, undefined, lang(ctxLang, { key: 'messageLengthGreater4096ErrorMessage', value: 'Ocorreu um erro ao tentar responder ao seu comando pois por algum motivo a mensagem ficou maior que 4096 caracteres. Nossa equipe já foi notificada e está trabalhando para resolver o problema o mais rápido possível. Desculpe pelo transtorno. Por favor, tente novamente!' }))
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxEditMessageReplyMarkup (ctx: Context, messageToEdit: { chatId: number, messageId: number } | undefined, options?: Other<RawApi, 'editMessageReplyMarkup', 'chat_id' | 'message_id' | 'inline_message_id'>): Promise<Update.Edited | undefined> {
  try {
    const ctxChatId = messageToEdit?.chatId ?? ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    const editMessageId = messageToEdit?.messageId ?? ctx.message?.message_id ?? ctx.update.callback_query?.message?.message_id
    if (editMessageId === undefined) {
      advError('MelodyScout_Bot - Error: editMessageId is undefined')
      return undefined
    }
    const editedMessageReplyMarkup = await ctx.api.editMessageReplyMarkup(ctxChatId, editMessageId, {
      ...options
    }).catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (editedMessageReplyMarkup === undefined) {
      advError('MelodyScout_Bot - Error: editedMessageReplyMarkup is undefined')
      return undefined
    }
    if (editedMessageReplyMarkup === true) {
      advError('MelodyScout_Bot - Error: editedMessageReplyMarkup is true')
      return undefined
    }
    return editedMessageReplyMarkup
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxTempReply (ctx: Context, message: string, timeout: number, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<Message.TextMessage | undefined> {
  try {
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxAnswerCallbackQuery (ctx: CallbackQueryContext<Context>, message?: string): Promise<void> {
  try {
    await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
      text: message
    }).catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxReplyWithVoice (ctx: Context, audio: string | InputFile, options?: Other<RawApi, 'sendVoice', 'chat_id' | 'voice'>): Promise<Message.VoiceMessage | undefined> {
  try {
    const ctxLang = ctx.from?.language_code
    const ctxChatId = ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    if ((options?.caption?.length ?? 0) > 1024) {
      advError('MelodyScout_Bot - Error: options.caption.length > 1024')
      void ctxReply(ctx, undefined, lang(ctxLang, { key: 'messageLengthGreater1024ErrorMessage', value: 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente mais tarde!' }))
      return
    }
    const loadingMessage = await ctxReply(ctx, undefined, lang(ctxLang, { key: 'sendingVoiceMessage', value: '<b>[🎤] Enviando áudio por favor aguarde!</b>' }), {
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxReplyWithAudio (ctx: Context, audio: string | InputFile, options?: Other<RawApi, 'sendAudio', 'audio' | 'chat_id'>): Promise<Message.AudioMessage | undefined> {
  try {
    const ctxLang = ctx.from?.language_code
    const ctxChatId = ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    if ((options?.caption?.length ?? 0) > 1024) {
      advError('MelodyScout_Bot - Error: options.caption.length > 1024')
      void ctxReply(ctx, undefined, lang(ctxLang, { key: 'messageLengthGreater1024ErrorMessage', value: 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente mais tarde!' }))
      return
    }
    const loadingMessage = await ctxReply(ctx, undefined, lang(ctxLang, { key: 'sendingAudioMessage', value: '<b>[🎵] Enviando áudio por favor aguarde!</b>' }), {
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxReplyWithVideo (ctx: Context, video: string | InputFile, options?: Other<RawApi, 'sendVideo', 'chat_id' | 'video'>): Promise<Message.VideoMessage | undefined> {
  try {
    const ctxLang = ctx.from?.language_code
    const ctxChatId = ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    if ((options?.caption?.length ?? 0) > 1024) {
      advError('MelodyScout_Bot - Error: options.caption.length > 1024')
      void ctxReply(ctx, undefined, lang(ctxLang, { key: 'messageLengthGreater1024ErrorMessage', value: 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente mais tarde!' }))
      return
    }
    const loadingMessage = await ctxReply(ctx, undefined, lang(ctxLang, { key: 'sendingVideoMessage', value: '<b>[🎥] Enviando vídeo por favor aguarde!</b>' }), {
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxReplyWithDocument (ctx: Context, file: string | InputFile, options?: Other<RawApi, 'sendDocument', 'chat_id' | 'document'>): Promise<Message.DocumentMessage | undefined> {
  try {
    const ctxLang = ctx.from?.language_code
    const ctxChatId = ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    if ((options?.caption?.length ?? 0) > 1024) {
      advError('MelodyScout_Bot - Error: options.caption.length > 1024')
      void ctxReply(ctx, undefined, lang(ctxLang, { key: 'messageLengthGreater1024ErrorMessage', value: 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente mais tarde!' }))
      return
    }
    const loadingMessage = await ctxReply(ctx, undefined, lang(ctxLang, { key: 'sendingDocumentMessage', value: '<b>[📁] Enviando arquivo por favor aguarde!</b>' }), {
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}

export async function ctxReplyWithPhoto (ctx: Context, photo: string | InputFile, options?: Other<RawApi, 'sendPhoto', 'chat_id' | 'photo'>): Promise<Message.PhotoMessage | undefined> {
  try {
    const ctxLang = ctx.from?.language_code
    const ctxChatId = ctx.chat?.id ?? ctx.from?.id
    if (ctxChatId === undefined) {
      advError('MelodyScout_Bot - Error: ctxChatId is undefined')
      return undefined
    }
    if ((options?.caption?.length ?? 0) > 1024) {
      advError('MelodyScout_Bot - Error: options.caption.length > 1024')
      void ctxReply(ctx, undefined, lang(ctxLang, { key: 'messageLengthGreater1024ErrorMessage', value: 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente mais tarde!' }))
      return
    }
    const loadingMessage = await ctxReply(ctx, undefined, lang(ctxLang, { key: 'sendingPhotoMessage', value: '<b>[📷] Enviando foto por favor aguarde!</b>' }), {
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
  } catch (error) {
    advError(`GrammyFunctions - Error: ${String(error)}`)
  }
}
