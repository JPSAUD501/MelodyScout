import { PrismaClient } from '@prisma/client'
import { AdvConsole } from '../../../function/advancedConsole'
import { CheckIfExists } from './checkIfExists'
import { Create } from './create'

type UpdateDefaultResponse = {
  success: true
  info: string
} | {
  success: false
  error: string
}

export class Update {
  private readonly advConsole: AdvConsole
  private readonly prisma: PrismaClient
  private readonly checkIfExists: CheckIfExists
  private readonly create: Create

  constructor (advConsole: AdvConsole, MsPrismaDbApi: PrismaClient, CheckIfExists: CheckIfExists, Create: Create) {
    this.advConsole = advConsole
    this.prisma = MsPrismaDbApi
    this.checkIfExists = CheckIfExists
    this.create = Create
  }

  async telegramUser (telegramUserId: string, lastfmUser: string | null): Promise<UpdateDefaultResponse> {
    const checkIfExists = await this.checkIfExists.telegramUser(telegramUserId)
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error }
    if (!checkIfExists.exists) {
      const createTelegramUser = await this.create.telegramUser(telegramUserId)
      if (!createTelegramUser.success) return { success: false, error: createTelegramUser.error }
    }
    const setTelegramUser = await this.prisma.telegramUsers.update({
      where: {
        telegramUserId
      },
      data: {
        lastfmUser,
        lastUpdate: new Date().getTime().toString()
      }
    }).catch((err) => {
      this.advConsole.error('Error while setting telegram user! Telegram User Id: ' + telegramUserId)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (setTelegramUser instanceof Error) return { success: false, error: setTelegramUser.message }
    return {
      success: true,
      info: 'Telegram user set!'
    }
  }

  async errorLog (errorId: string, error: string, userId: string, chatId: string, messageId?: string): Promise<UpdateDefaultResponse> {
    const checkIfExists = await this.checkIfExists.errorLog(errorId)
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error }
    if (!checkIfExists.exists) {
      const createErrorLog = await this.create.errorLog(error, userId, chatId, messageId)
      if (!createErrorLog.success) return { success: false, error: createErrorLog.error }
    }
    const setErrorLog = await this.prisma.errorLog.update({
      where: {
        id: Number(errorId)
      },
      data: {
        error,
        userId,
        chatId,
        messageId
      }
    }).catch((err) => {
      this.advConsole.error('Error while setting error log! Error: ' + error)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (setErrorLog instanceof Error) return { success: false, error: setErrorLog.message }
    return {
      success: true,
      info: 'Error log set!'
    }
  }
}
