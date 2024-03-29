import { type PrismaClient } from '@prisma/client'
import { advError } from '../../../functions/advancedConsole'

type CreateDefaultResponse = {
  success: true
  info: string
} | {
  success: false
  error: string
}

export class Create {
  private readonly prisma: PrismaClient

  constructor (MsPrismaDbApi: PrismaClient) {
    this.prisma = MsPrismaDbApi
  }

  async telegramUser (telegramUserId: string): Promise<CreateDefaultResponse> {
    const createdTelegramUser = await this.prisma.telegramUsers.create({
      data: {
        telegramUserId,
        lastUpdate: new Date().getTime().toString()
      }
    }).catch((err) => {
      advError('Error while creating new telegram user! Telegram User Id: ' + telegramUserId)
      advError(err)
      return new Error(err)
    })
    if (createdTelegramUser instanceof Error) return { success: false, error: createdTelegramUser.message }
    return { success: true, info: 'Telegram user created!' }
  }

  async postRollout (chatId: string): Promise<CreateDefaultResponse> {
    const createdChatIdPosted = await this.prisma.postRollout.create({
      data: {
        telegramChatId: chatId,
        posted: false
      }
    }).catch((err) => {
      advError('Error while creating new chatIdPosted! ChatId: ' + chatId)
      advError(err)
      return new Error(err)
    })
    if (createdChatIdPosted instanceof Error) return { success: false, error: createdChatIdPosted.message }
    return { success: true, info: 'ChatIdPosted created!' }
  }
}
