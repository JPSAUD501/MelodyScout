import { PrismaClient } from '@prisma/client'
import { AdvConsole } from '../../../function/advancedConsole'

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

  constructor (advConsole: AdvConsole, MsPrismaDbApi: PrismaClient) {
    this.advConsole = advConsole
    this.prisma = MsPrismaDbApi
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

  async errorLog (errorId: string): Promise<CheckIfExistsDefaultResponse> {
    const errorLogExists = await this.prisma.errorLog.findUnique({
      where: {
        id: Number(errorId)
      }
    }).catch((err) => {
      this.advConsole.error('Error while checking if error log exists in database! Error ID: ' + errorId)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (errorLogExists instanceof Error) return { success: false, error: errorLogExists.message }
    if (errorLogExists === null) {
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
