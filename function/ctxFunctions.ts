import { CallbackQueryContext, CommandContext, Context, InputFile, RawApi } from 'grammy'
import { AdvConsole } from './advancedConsole'
import { Other } from 'grammy/out/core/api'
import { Message } from '@grammyjs/types'

export class CtxFunctions {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

  async pinMessage (ctx: CommandContext<Context> | CallbackQueryContext<Context>, message: Message.TextMessage): Promise<void> {
    const pinedMessage = await ctx.api.pinChatMessage(message.chat.id, message.message_id).catch((_err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(_err)}`)
      return undefined
    })
    if (pinedMessage === undefined) {
      if (ctx.chat === undefined) return
      const alertMessage = await ctx.api.sendMessage(ctx.chat.id, '[⚠] Não foi possível fixar a mensagem automaticamente. Caso queira você ainda pode fixa-la manualmente. Para isso, clique na mensagem acima e em seguida em "Fixar".\n\nEssa mensagem de aviso será apagada em 15 segundos.', { parse_mode: 'HTML' }).catch((err) => {
        this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
      })
      if (alertMessage === undefined) return
      setTimeout(() => {
        if (ctx.chat === undefined) return
        void ctx.api.deleteMessage(ctx.chat.id, alertMessage.message_id).catch((err) => {
          this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
        })
      }, 15000)
    }
  }

  async editMessage (ctx: CommandContext<Context> | CallbackQueryContext<Context>, text: string, options?: Other<RawApi, 'editMessageText', 'text' | 'chat_id' | 'message_id'>): Promise<true | Message.TextMessage | undefined> {
    if (ctx.chat === undefined) {
      this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
      return undefined
    }
    if (text.length > 4096) {
      this.advConsole.error('MelodyScout_Bot - Error: text length is greater than 4096')
      await this.reply(ctx, 'Ocorreu um erro ao tentar responder ao seu comando. Nossa equipe já foi notificada e está trabalhando para resolver o problema o mais rápido possível. Desculpe pelo transtorno. Por favor, tente novamente!')
      return undefined
    }
    const editMessageId = ctx.message?.message_id ?? ctx.update.callback_query?.message?.message_id
    if (editMessageId === undefined) {
      this.advConsole.error('MelodyScout_Bot - Error: editMessageId is undefined')
      return undefined
    }
    const editedMessage = await ctx.api.editMessageText(ctx.chat.id, editMessageId, text, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (editedMessage === undefined) return
    return editedMessage
  }

  async reply (ctx: CommandContext<Context> | CallbackQueryContext<Context>, message: string, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<Message.TextMessage | undefined> {
    if (ctx.chat === undefined) {
      this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
      return undefined
    }
    if (message.length > 4096) {
      this.advConsole.error('MelodyScout_Bot - Error: message length is greater than 4096')
      await this.reply(ctx, 'Ocorreu um erro ao tentar responder ao seu comando. Nossa equipe já foi notificada e está trabalhando para resolver o problema o mais rápido possível. Desculpe pelo transtorno. Por favor, tente novamente!')
      return
    }
    const sendedMessage = await ctx.api.sendMessage(ctx.chat.id, message, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
      this.advConsole.error(`MelodyScout_Bot - In Reply: ${message}`)
      return undefined
    })
    if (sendedMessage === undefined) return
    return sendedMessage
  }

  async loadingReply (ctx: CommandContext<Context> | CallbackQueryContext<Context>, message: string, timeout: number, options?: Other<RawApi, 'sendMessage', 'text' | 'chat_id'>): Promise<Message.TextMessage | undefined> {
    if (ctx.chat === undefined) {
      this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
      return undefined
    }
    const sendedMessage = await ctx.api.sendMessage(ctx.chat.id, message, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
      this.advConsole.error(`MelodyScout_Bot - In Reply: ${message}`)
      return undefined
    })
    if (sendedMessage === undefined) return
    setTimeout(() => {
      if (ctx.chat === undefined) return
      void ctx.api.deleteMessage(ctx.chat.id, sendedMessage.message_id).catch(() => {
        this.advConsole.error('MelodyScout_Bot - Error: Failed to delete loading message')
      })
    }, timeout)
    return sendedMessage
  }

  async answerCallbackQuery (ctx: CallbackQueryContext<Context>, message?: string): Promise<void> {
    await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
      text: message
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async replyWithVoice (ctx: CommandContext<Context> | CallbackQueryContext<Context>, audio: string | InputFile, options?: Other<RawApi, 'sendVoice', 'chat_id' | 'voice'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    if ((options?.caption?.length ?? 0) > 1024) {
      this.advConsole.error('MelodyScout_Bot - Error: options.caption.length > 1024')
      void this.reply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
      return
    }
    const loadingMessage = await ctx.reply('<b>[🎤] Enviando audio por favor aguarde!</b>', {
      parse_mode: 'HTML',
      disable_notification: true
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (loadingMessage === undefined) return this.advConsole.error('MelodyScout_Bot - Error: loadingMessage is undefined')
    await ctx.api.sendVoice(ctx.chat.id, audio, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async replyWithAudio (ctx: CommandContext<Context> | CallbackQueryContext<Context>, audio: string | InputFile, options?: Other<RawApi, 'sendAudio', 'audio' | 'chat_id'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    if ((options?.caption?.length ?? 0) > 1024) {
      this.advConsole.error('MelodyScout_Bot - Error: options.caption.length > 1024')
      void this.reply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
      return
    }
    const loadingMessage = await ctx.reply('<b>[🎵] Enviando audio por favor aguarde!</b>', {
      parse_mode: 'HTML',
      disable_notification: true
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (loadingMessage === undefined) return this.advConsole.error('MelodyScout_Bot - Error: loadingMessage is undefined')
    await ctx.api.sendAudio(ctx.chat.id, audio, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async replyWithVideo (ctx: CommandContext<Context> | CallbackQueryContext<Context>, video: string | InputFile, options?: Other<RawApi, 'sendVideo', 'chat_id' | 'video'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    if ((options?.caption?.length ?? 0) > 1024) {
      this.advConsole.error('MelodyScout_Bot - Error: options.caption.length > 1024')
      void this.reply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
      return
    }
    const loadingMessage = await ctx.reply('<b>[🎥] Enviando vídeo por favor aguarde!</b>', {
      parse_mode: 'HTML',
      disable_notification: true
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (loadingMessage === undefined) return this.advConsole.error('MelodyScout_Bot - Error: loadingMessage is undefined')
    await ctx.api.sendVideo(ctx.chat.id, video, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async replyWithFile (ctx: CommandContext<Context> | CallbackQueryContext<Context>, file: string | InputFile, options?: Other<RawApi, 'sendDocument', 'chat_id' | 'document'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    if ((options?.caption?.length ?? 0) > 1024) {
      this.advConsole.error('MelodyScout_Bot - Error: options.caption.length > 1024')
      void this.reply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
      return
    }
    const loadingMessage = await ctx.reply('<b>[📁] Enviando arquivo por favor aguarde!</b>', {
      parse_mode: 'HTML',
      disable_notification: true
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (loadingMessage === undefined) return this.advConsole.error('MelodyScout_Bot - Error: loadingMessage is undefined')
    await ctx.api.sendDocument(ctx.chat.id, file, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }

  async replyWithPhoto (ctx: CommandContext<Context> | CallbackQueryContext<Context>, photo: string | InputFile, options?: Other<RawApi, 'sendPhoto', 'chat_id' | 'photo'>): Promise<void> {
    if (ctx.chat === undefined) return this.advConsole.error('MelodyScout_Bot - Error: ctx.chat is undefined')
    if ((options?.caption?.length ?? 0) > 1024) {
      this.advConsole.error('MelodyScout_Bot - Error: options.caption.length > 1024')
      void this.reply(ctx, 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente!')
      return
    }
    const loadingMessage = await ctx.reply('<b>[📷] Enviando foto por favor aguarde!</b>', {
      parse_mode: 'HTML',
      disable_notification: true
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    if (loadingMessage === undefined) return this.advConsole.error('MelodyScout_Bot - Error: loadingMessage is undefined')
    await ctx.api.sendPhoto(ctx.chat.id, photo, {
      parse_mode: 'HTML',
      ...options
    }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
    await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${String(err)}`)
    })
  }
}
