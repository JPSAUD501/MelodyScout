import { type PrismaClient } from '@prisma/client'
import { advError } from '../../../functions/advancedConsole'

interface GetDefaultResponseError {
  success: false
  error: string
}

export class Get {
  private readonly prisma: PrismaClient

  constructor (MsPrismaDbApi: PrismaClient) {
    this.prisma = MsPrismaDbApi
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
}
