import { PrismaClient } from '@prisma/client'
import { AdvConsole } from '../../advancedConsole'

type CreateDefaultResponse = {
  success: true
  info: string
} | {
  success: false
  error: string
}

export class Create {
  private readonly advConsole: AdvConsole
  private readonly prisma: PrismaClient

  constructor (AdvConsole: AdvConsole, PrismaDB: PrismaClient) {
    this.advConsole = AdvConsole
    this.prisma = PrismaDB
  }

  async trackerChat (chatId: string): Promise<CreateDefaultResponse> {
    const createdTrackerChat = await this.prisma.trackerChats.create({
      data: {
        chatId
      }
    }).catch((err) => {
      this.advConsole.error('Error while creating new tracker chat! ChatId: ' + chatId)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (createdTrackerChat instanceof Error) return { success: false, error: createdTrackerChat.message }
    return { success: true, info: 'Tracker chat created!' }
  }

  async trackingUser (lastfmUser: string): Promise<CreateDefaultResponse> {
    const createdTrackingUser = await this.prisma.trackingUsers.create({
      data: {
        lastfmUser
      }
    }).catch((err) => {
      this.advConsole.error('Error while creating new tracking user! LastFM User: ' + lastfmUser)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (createdTrackingUser instanceof Error) return { success: false, error: createdTrackingUser.message }
    return { success: true, info: 'Tracking user created!' }
  }

  async telegramUser (telegramUserId: string): Promise<CreateDefaultResponse> {
    const createdTelegramUser = await this.prisma.telegramUsers.create({
      data: {
        telegramUserId,
        lastUpdate: new Date().getTime().toString()
      }
    }).catch((err) => {
      this.advConsole.error('Error while creating new telegram user! Telegram User Id: ' + telegramUserId)
      this.advConsole.error(err)
      return new Error(err)
    })
    if (createdTelegramUser instanceof Error) return { success: false, error: createdTelegramUser.message }
    return { success: true, info: 'Telegram user created!' }
  }
}
