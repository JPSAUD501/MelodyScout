import { type PrismaClient } from '@prisma/client'
import { advError } from '../../../functions/advancedConsole'
import { type Create } from './create'
import { type CheckIfExists } from './checkIfExists'

interface GetDefaultResponseError {
  success: false
  error: string
}

export class Get {
  private readonly prisma: PrismaClient
  private readonly checkIfExists: CheckIfExists
  private readonly create: Create

  constructor (MsPrismaDbApi: PrismaClient, CheckIfExists: CheckIfExists, Create: Create) {
    this.prisma = MsPrismaDbApi
    this.checkIfExists = CheckIfExists
    this.create = Create
  }

  async telegramUser (telegramUserId: string): Promise<GetDefaultResponseError | { success: true, lastfmUser: string | null, lastUpdate: string }> {
    const getTelegramUser = await this.prisma.telegramUsers.findUnique({
      where: {
        telegramUserId
      },
      select: {
        lastfmUser: true,
        lastUpdate: true
      }
    }).catch((err) => {
      advError('Error while getting telegram user! TelegramId: ' + telegramUserId)
      advError(err)
      return new Error(err)
    })
    if (getTelegramUser instanceof Error) return { success: false, error: getTelegramUser.message }
    if (getTelegramUser === null) return { success: false, error: 'Telegram user does not exist!' }
    return {
      success: true,
      lastfmUser: getTelegramUser.lastfmUser,
      lastUpdate: getTelegramUser.lastUpdate
    }
  }

  async allTelegramUsers (): Promise<GetDefaultResponseError | { success: true, telegramUsers: Array<{ telegramUserId: string, lastfmUser: string | null, lastUpdate: string }> }> {
    const getAllTelegramUsers = await this.prisma.telegramUsers.findMany({
      select: {
        telegramUserId: true,
        lastfmUser: true,
        lastUpdate: true
      }
    }).catch((err) => {
      advError('Error while getting all telegram users!')
      advError(err)
      return new Error(err)
    })
    if (getAllTelegramUsers instanceof Error) return { success: false, error: getAllTelegramUsers.message }
    return {
      success: true,
      telegramUsers: getAllTelegramUsers
    }
  }

  async postRolloutStatus (chatId: string): Promise<GetDefaultResponseError | { success: true, posted: boolean }> {
    const checkIfExists = await this.checkIfExists.postRollout(chatId)
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error }
    if (!checkIfExists.exists) {
      const createPostRollout = await this.create.postRollout(chatId)
      if (!createPostRollout.success) return { success: false, error: createPostRollout.error }
    }
    const getChatIdPosted = await this.prisma.postRollout.findUnique({
      where: {
        telegramChatId: chatId
      },
      select: {
        posted: true
      }
    }).catch((err) => {
      advError('Error while getting chatIdPosted! ChatId: ' + chatId)
      advError(err)
      return new Error(err)
    })
    if (getChatIdPosted instanceof Error) return { success: false, error: getChatIdPosted.message }
    if (getChatIdPosted === null) return { success: false, error: 'ChatIdPosted still does not exist!' }
    return {
      success: true,
      posted: getChatIdPosted.posted
    }
  }
}
