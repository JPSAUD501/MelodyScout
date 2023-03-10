import { PrismaClient } from '@prisma/client'
import { AdvConsole } from '../../../function/advancedConsole'

interface GetDefaultResponseError {
  success: false
  error: string
}

export class Get {
  private readonly advConsole: AdvConsole
  private readonly prisma: PrismaClient

  constructor (advConsole: AdvConsole, MsPrismaDbApi: PrismaClient) {
    this.advConsole = advConsole
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
      this.advConsole.error('Error while getting telegram user! TelegramId: ' + telegramUserId)
      this.advConsole.error(err)
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
      this.advConsole.error('Error while getting all telegram users!')
      this.advConsole.error(err)
      return new Error(err)
    })
    if (getAllTelegramUsers instanceof Error) return { success: false, error: getAllTelegramUsers.message }
    return {
      success: true,
      telegramUsers: getAllTelegramUsers
    }
  }

  async errorLog (errorId: string): Promise<GetDefaultResponseError | { success: true, errorLog: { errorId: number, date: string, error: string, userId: string, chatId: string, messageId: string | null } }> {
    const getErrorLog = await this.prisma.errorLog.findUnique({
      where: {
        id: Number(errorId)
      },
      select: {
        id: true,
        date: true,
        error: true,
        userId: true,
        chatId: true,
        messageId: true
      }
    }).catch((err) => {
      this.advConsole.error('Error while getting error log! ErrorId: ' + errorId)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (getErrorLog instanceof Error) return { success: false, error: getErrorLog.message }
    if (getErrorLog === null) return { success: false, error: 'Error log does not exist!' }
    return {
      success: true,
      errorLog: {
        errorId: getErrorLog.id,
        date: getErrorLog.date,
        error: getErrorLog.error,
        userId: getErrorLog.userId,
        chatId: getErrorLog.chatId,
        messageId: getErrorLog.messageId
      }
    }
  }
}
