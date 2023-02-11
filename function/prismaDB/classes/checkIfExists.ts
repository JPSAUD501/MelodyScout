import { PrismaClient } from '@prisma/client'
import { AdvConsole } from '../../advancedConsole'

type CheckIfExistsDefaultResponse = {
  success: true
  exists: boolean
} | {
  success: false
  error: string
}

export class CheckIfExists {
  private readonly advConsole: AdvConsole
  private readonly prisma: PrismaClient

  constructor (AdvConsole: AdvConsole, PrismaDB: PrismaClient) {
    this.advConsole = AdvConsole
    this.prisma = PrismaDB
  }

  async telegramUser (telegramUserId: string): Promise<CheckIfExistsDefaultResponse> {
    const telegramUserExists = await this.prisma.telegramUsers.findUnique({
      where: {
        telegramUserId
      }
    }).catch((err) => {
      this.advConsole.error('Error while checking if user exists in database! Telegram User ID: ' + telegramUserId)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (telegramUserExists instanceof Error) return { success: false, error: telegramUserExists.message }
    if (telegramUserExists === null) {
      return {
        success: true,
        exists: false
      }
    }
    return {
      success: true,
      exists: true
    }
  }
}
