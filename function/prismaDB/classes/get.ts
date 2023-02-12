import { PrismaClient } from '@prisma/client'
import { AdvConsole } from '../../advancedConsole'
import { CheckIfExists } from './checkIfExists'
import { Create } from './create'

interface GetDefaultResponseError {
  success: false
  error: string
}

export class Get {
  private readonly advConsole: AdvConsole
  private readonly prisma: PrismaClient
  private readonly checkIfExists: CheckIfExists
  private readonly create: Create

  constructor (AdvConsole: AdvConsole, PrismaDB: PrismaClient, CheckIfExists: CheckIfExists, Create: Create) {
    this.advConsole = AdvConsole
    this.prisma = PrismaDB
    this.checkIfExists = CheckIfExists
    this.create = Create
  }

  async telegramUser (telegramUserId: string): Promise<GetDefaultResponseError | { success: true, lastfmUser: string | null, lastUpdate: string }> {
    const checkIfExists = await this.checkIfExists.telegramUser(telegramUserId)
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error }
    if (!checkIfExists.exists) {
      const createTelegramUser = await this.create.telegramUser(telegramUserId)
      if (!createTelegramUser.success) return { success: false, error: createTelegramUser.error }
    }
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
}
