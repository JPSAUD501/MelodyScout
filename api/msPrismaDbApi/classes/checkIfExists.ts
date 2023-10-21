import { type PrismaClient } from '@prisma/client'
import { advError } from '../../../functions/advancedConsole'

type CheckIfExistsDefaultResponse = {
  success: true
  exists: boolean
} | {
  success: false
  error: string
}

export class CheckIfExists {
  private readonly prisma: PrismaClient

  constructor (MsPrismaDbApi: PrismaClient) {
    this.prisma = MsPrismaDbApi
  }

  async telegramUser (telegramUserId: string): Promise<CheckIfExistsDefaultResponse> {
    const telegramUserExists = await this.prisma.telegramUsers.findUnique({
      where: {
        telegramUserId
      }
    }).catch((err) => {
      advError('Error while checking if user exists in database! Telegram User ID: ' + telegramUserId)
      advError(err)
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
