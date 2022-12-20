import { PrismaClient } from "@prisma/client";
import { AdvConsole } from "../../advancedConsole";
import { CheckIfExists } from "./checkIfExists";
import { Create } from "./create";

type GetDefaultResponseError = {
  success: false;
  error: string;
};

export class Get {
  private advConsole: AdvConsole;
  private prisma: PrismaClient;
  private checkIfExists: CheckIfExists;
  private create: Create;

  constructor (AdvConsole: AdvConsole, PrismaDB: PrismaClient, CheckIfExists: CheckIfExists, Create: Create) {
    this.advConsole = AdvConsole;
    this.prisma = PrismaDB;
    this.checkIfExists = CheckIfExists;
    this.create = Create;
  }

  async trackerChat (chatId: string): Promise<GetDefaultResponseError | { success: true, trackingUsers: string[] }> {
    const checkIfExists = await this.checkIfExists.trackerChat(chatId);
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error };
    if (!checkIfExists.exists) return { success: false, error: 'Tracker chat does not exist!' };
    const getTrackerChat = await this.prisma.trackerChats.findUnique({
      where: {
        chatId
      },
      select: {
        trackingUsers: true
      }
    }).catch((err) => {
      this.advConsole.error('Error while getting tracker chat! ChatId: ' + chatId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (getTrackerChat instanceof Error) return { success: false, error: getTrackerChat.message };
    const trackingUsers = getTrackerChat?.trackingUsers.map((trackingUser) => {
      return trackingUser.lastfmUser;
    }) || [];
    return {
      success: true,
      trackingUsers
    }
  }

  async trackingUser (lastfmUser: string): Promise<GetDefaultResponseError | { success: true, trackingInChats: string[] }> {
    const checkIfExists = await this.checkIfExists.trackingUser(lastfmUser);
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error };
    if (!checkIfExists.exists) {
      const createTrackingUser = await this.create.trackingUser(lastfmUser);
      if (!createTrackingUser.success) return { success: false, error: createTrackingUser.error };
    }
    const getTrackingUser = await this.prisma.trackingUsers.findUnique({
      where: {
        lastfmUser
      },
      select: {
        trackingInChats: true
      }
    }).catch((err) => {
      this.advConsole.error('Error while getting tracking user! LastfmUser: ' + lastfmUser);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (getTrackingUser instanceof Error) return { success: false, error: getTrackingUser.message };
    if (!getTrackingUser) return { success: false, error: 'Tracking user does not exist!' };
    const trackingInChats = getTrackingUser.trackingInChats.map((trackerChat) => {
      return trackerChat.chatId;
    }) || [];
    return {
      success: true,
      trackingInChats
    }
  }

  async telegramUser (telegramUserId: string): Promise<GetDefaultResponseError | { success: true, lastfmUser: string | null, lastUpdate: number }> {
    const checkIfExists = await this.checkIfExists.telegramUser(telegramUserId);
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error };
    if (!checkIfExists.exists) {
      const createTelegramUser = await this.create.telegramUser(telegramUserId);
      if (!createTelegramUser.success) return { success: false, error: createTelegramUser.error };
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
      this.advConsole.error('Error while getting telegram user! TelegramId: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (getTelegramUser instanceof Error) return { success: false, error: getTelegramUser.message };
    if (!getTelegramUser) return { success: false, error: 'Telegram user does not exist!' };
    return {
      success: true,
      lastfmUser: getTelegramUser.lastfmUser,
      lastUpdate: getTelegramUser.lastUpdate
    }
  }
}