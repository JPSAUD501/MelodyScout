import { PrismaClient } from "@prisma/client";
import { AdvConsole } from "../../advancedConsole";

type CheckIfExistsDefaultResponse = {
  success: true;
  exists: boolean;
} | {
  success: false;
  error: string;
};

export class CheckIfExists {
  private advConsole: AdvConsole;
  private prisma: PrismaClient;

  constructor (AdvConsole: AdvConsole, PrismaDB: PrismaClient) {
    this.advConsole = AdvConsole;
    this.prisma = PrismaDB;
  }

  async trackerChat (chatId: string): Promise<CheckIfExistsDefaultResponse> {
    const trackerChatExists = await this.prisma.trackerChats.findUnique({
      where: {
        chatId: chatId
      }
    }).catch((err) => {
      this.advConsole.error('Error while checking if chat exists in database! ChatId: ' + chatId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (trackerChatExists instanceof Error) return { success: false, error: trackerChatExists.message}
    if (!trackerChatExists) return {
      success: true,
      exists: false
    }
    return {
      success: true,
      exists: true
    }
  }

  async trackingUser (lastfmUser: string): Promise<CheckIfExistsDefaultResponse> {
    const trackingUserExists = await this.prisma.trackingUsers.findUnique({
      where: {
        lastfmUser: lastfmUser
      }
    }).catch((err) => {
      this.advConsole.error('Error while checking if user exists in database! LastFM User: ' + lastfmUser);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (trackingUserExists instanceof Error) return { success: false, error: trackingUserExists.message}
    if (!trackingUserExists) return {
      success: true,
      exists: false
    }
    return {
      success: true,
      exists: true
    }
  }

  async telegramUser (telegramUserId: string): Promise<CheckIfExistsDefaultResponse> {
    const telegramUserExists = await this.prisma.telegramUsers.findUnique({
      where: {
        telegramUserId: telegramUserId
      }
    }).catch((err) => {
      this.advConsole.error('Error while checking if user exists in database! Telegram User ID: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (telegramUserExists instanceof Error) return { success: false, error: telegramUserExists.message}
    if (!telegramUserExists) return {
      success: true,
      exists: false
    }
    return {
      success: true,
      exists: true
    }
  }
}