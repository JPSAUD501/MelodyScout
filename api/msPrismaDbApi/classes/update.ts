import { type PrismaClient } from '@prisma/client'
import { type CheckIfExists } from './checkIfExists'
import { type Create } from './create'
import { advError } from '../../../functions/advancedConsole'

type UpdateDefaultResponse = {
  success: true
  info: string
} | {
  success: false
  error: string
}

export class Update {
  private readonly prisma: PrismaClient
  private readonly checkIfExists: CheckIfExists
  private readonly create: Create

  constructor (MsPrismaDbApi: PrismaClient, CheckIfExists: CheckIfExists, Create: Create) {
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
      advError('Error while setting telegram user! Telegram User Id: ' + telegramUserId)
      advError(err)
      return new Error(err)
    })
    if (setTelegramUser instanceof Error) return { success: false, error: setTelegramUser.message }
    return {
      success: true,
      info: 'Telegram user set!'
    }
  }

  async postRollout (chatId: string, posted: boolean): Promise<UpdateDefaultResponse> {
    const checkIfExists = await this.checkIfExists.postRollout(chatId)
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error }
    if (!checkIfExists.exists) {
      const createPostRollout = await this.create.postRollout(chatId)
      if (!createPostRollout.success) return { success: false, error: createPostRollout.error }
    }
    const setPostRollout = await this.prisma.postRollout.update({
      where: {
        telegramChatId: chatId
      },
      data: {
        posted
      }
    }).catch((err) => {
      advError('Error while setting postRollout! ChatId: ' + chatId)
      advError(err)
      return new Error(err)
    })
    if (setPostRollout instanceof Error) return { success: false, error: setPostRollout.message }
    return {
      success: true,
      info: 'PostRollout set!'
    }
  }

  async resetPostRollout (status: boolean): Promise<UpdateDefaultResponse> {
    const resetPostRollout = await this.prisma.postRollout.updateMany({
      data: {
        posted: status
      }
    }).catch((err) => {
      advError('Error while resetting postRollout!')
      advError(err)
      return new Error(err)
    })
    if (resetPostRollout instanceof Error) return { success: false, error: resetPostRollout.message }
    return {
      success: true,
      info: `PostRollout reset to ${status}!`
    }
  }
}
