import { PrismaClient } from "@prisma/client";
import { AdvConsole } from "../advancedConsole";

type CreateDefaultResponse = {
  success: true;
  info: string;
} | {
  success: false;
  error: string;
};

export class Create {
  private advConsole: AdvConsole;
  private prisma: PrismaClient;

  constructor (AdvConsole: AdvConsole, PrismaDB: PrismaClient) {
    this.advConsole = AdvConsole;
    this.prisma = PrismaDB;
  }

  async trackerChat (chatId: string): Promise<CreateDefaultResponse> {
    const createdTrackerChat = await this.prisma.trackerChats.create({
      data: {
        chatId: chatId,
      }
    }).catch((err) => {
      this.advConsole.error('Error while creating new tracker chat! ChatId: ' + chatId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (createdTrackerChat instanceof Error) return { success: false, error: createdTrackerChat.message };
    if (!createdTrackerChat) return { success: false, error: "Tracker chat not created!" };
    return { success: true, info: "Tracker chat created!" };
  }

  async trackingUser (lastfmUser: string): Promise<CreateDefaultResponse> {
    const createdTrackingUser = await this.prisma.trackingUsers.create({
      data: {
        lastfmUser: lastfmUser,
      }
    }).catch((err) => {
      this.advConsole.error('Error while creating new tracking user! LastFM User: ' + lastfmUser);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (createdTrackingUser instanceof Error) return { success: false, error: createdTrackingUser.message };
    if (!createdTrackingUser) return { success: false, error: "Tracking user not created!" };
    return { success: true, info: "Tracking user created!" };
  }

  async telegramUser (telegramUserId: string, lastfmUser: string): Promise<CreateDefaultResponse> {
    const createdTelegramUser = await this.prisma.telegramUsers.create({
      data: {
        telegramUserId: telegramUserId,
        lastUpdate: new Date().getTime(),
      }
    }).catch((err) => {
      this.advConsole.error('Error while creating new telegram user! Telegram User Id: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (createdTelegramUser instanceof Error) return { success: false, error: createdTelegramUser.message };
    if (!createdTelegramUser) return { success: false, error: "Telegram user not created!" };
    return { success: true, info: "Telegram user created!" };
  }
}