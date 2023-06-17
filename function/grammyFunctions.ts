import { CallbackQueryContext, Context, InputFile, RawApi } from 'grammy'
import { advError } from './advancedConsole'
import { Message } from '@grammyjs/types'
import { Other } from 'grammy/out/core/api'

export async function ctxReply (ctx: Context, message: string, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<Message.TextMessage | undefined> {
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  if (message.length > 4096) {
    advError('MelodyScout_Bot - Error: message length is greater than 4096')
    await ctxReply(ctx, 'Ocorreu um erro ao tentar responder ao seu comando pois por algum motivo a mensagem ficou maior que 4096 caracteres. Nossa equipe já foi notificada e está trabalhando para resolver o problema o mais rápido possível. Desculpe pelo transtorno. Por favor, tente novamente!')
    return
  }
  const sendedMessage = await ctx.api.sendMessage(ctx.chat.id, message, {
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

export async function ctxPinMessage (ctx: Context, message: Message): Promise<void> {
  const pinedMessage = await ctx.api.pinChatMessage(message.chat.id, message.message_id).catch((_err) => {
    advError(`MelodyScout_Bot - Error: ${String(_err)}`)
    return undefined
  })
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return
  }
  if (pinedMessage === undefined) {
    if (message.chat === undefined) return
    const alertMessage = await ctx.api.sendMessage(ctx.chat.id, '[⚠] Não foi possível fixar a mensagem automaticamente. Caso queira você ainda pode fixa-la manualmente. Para isso, clique na mensagem acima e em seguida em "Fixar".\n\nEssa mensagem de aviso será apagada em 15 segundos.', { parse_mode: 'HTML' }).catch((err) => {
      advError(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (alertMessage === undefined) {
      advError('MelodyScout_Bot - Error: alertMessage is undefined')
      return
    }
    setTimeout(() => {
      if (ctx.chat === undefined) {
        advError('MelodyScout_Bot - Error: ctx.chat is undefined')
        return
      }
      void ctx.api.deleteMessage(ctx.chat.id, alertMessage.message_id).catch((err) => {
        advError(`MelodyScout_Bot - Error: ${String(err)}`)
      })
    }, 15000)
  }
}

export async function ctxEditMessage (ctx: Context, text: string, options?: Other<RawApi, 'editMessageText', 'text' | 'chat_id' | 'message_id'>): Promise<Message.TextMessage | undefined> {
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  if (text.length > 4096) {
    advError('MelodyScout_Bot - Error: text length is greater than 4096')
    await ctxReply(ctx, 'Ocorreu um erro ao tentar responder ao seu comando. Nossa equipe já foi notificada e está trabalhando para resolver o problema o mais rápido possível. Desculpe pelo transtorno. Por favor, tente novamente!')
    return undefined
  }
  const editMessageId = ctx.message?.message_id ?? ctx.update.callback_query?.message?.message_id
  if (editMessageId === undefined) {
    advError('MelodyScout_Bot - Error: editMessageId is undefined')
    return undefined
  }
  const editedMessage = await ctx.api.editMessageText(ctx.chat.id, editMessageId, text, {
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
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  const sendedMessage = await ctx.api.sendMessage(ctx.chat.id, message, {
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
    if (ctx.chat === undefined) {
      advError('MelodyScout_Bot - Error: ctx.chat is undefined')
      return
    }
    void ctx.api.deleteMessage(ctx.chat.id, sendedMessage.message_id).catch(() => {
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
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
    return
  }
  const loadingMessage = await ctxReply(ctx, '<b>[🎤] Enviando áudio por favor aguarde!</b>', {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const voiceMessage = await ctx.api.sendVoice(ctx.chat.id, audio, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (voiceMessage === undefined) {
    advError('MelodyScout_Bot - Error: voiceMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return voiceMessage
}

export async function ctxReplyWithAudio (ctx: Context, audio: string | InputFile, options?: Other<RawApi, 'sendAudio', 'audio' | 'chat_id'>): Promise<Message.AudioMessage | undefined> {
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
    return
  }
  const loadingMessage = await ctxReply(ctx, '<b>[🎵] Enviando áudio por favor aguarde!</b>', {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const audioMessage = await ctx.api.sendAudio(ctx.chat.id, audio, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (audioMessage === undefined) {
    advError('MelodyScout_Bot - Error: audioMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return audioMessage
}

export async function ctxReplyWithVideo (ctx: Context, video: string | InputFile, options?: Other<RawApi, 'sendVideo', 'chat_id' | 'video'>): Promise<Message.VideoMessage | undefined> {
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
    return
  }
  const loadingMessage = await ctxReply(ctx, '<b>[🎥] Enviando vídeo por favor aguarde!</b>', {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const videoMessage = await ctx.api.sendVideo(ctx.chat.id, video, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (videoMessage === undefined) {
    advError('MelodyScout_Bot - Error: videoMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return videoMessage
}

export async function ctxReplyWithDocument (ctx: Context, file: string | InputFile, options?: Other<RawApi, 'sendDocument', 'chat_id' | 'document'>): Promise<Message.DocumentMessage | undefined> {
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
    return
  }
  const loadingMessage = await ctxReply(ctx, '<b>[📁] Enviando arquivo por favor aguarde!</b>', {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const documentMessage = await ctx.api.sendDocument(ctx.chat.id, file, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (documentMessage === undefined) {
    advError('MelodyScout_Bot - Error: documentMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return documentMessage
}

export async function ctxReplyWithPhoto (ctx: Context, photo: string | InputFile, options?: Other<RawApi, 'sendPhoto', 'chat_id' | 'photo'>): Promise<Message.PhotoMessage | undefined> {
  if (ctx.chat === undefined) {
    advError('MelodyScout_Bot - Error: ctx.chat is undefined')
    return undefined
  }
  if ((options?.caption?.length ?? 0) > 1024) {
    advError('MelodyScout_Bot - Error: options.caption.length > 1024')
    void ctxReply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
    return
  }
  const loadingMessage = await ctxReply(ctx, '<b>[📷] Enviando foto por favor aguarde!</b>', {
    parse_mode: 'HTML',
    disable_notification: true
  })
  if (loadingMessage === undefined) {
    advError('MelodyScout_Bot - Error: loadingMessage is undefined')
    return undefined
  }
  const photoMessage = await ctx.api.sendPhoto(ctx.chat.id, photo, {
    parse_mode: 'HTML',
    ...options
  }).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  if (photoMessage === undefined) {
    advError('MelodyScout_Bot - Error: photoMessage is undefined')
    return undefined
  }
  await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
    advError(`MelodyScout_Bot - Error: ${String(err)}`)
  })
  return photoMessage
}
