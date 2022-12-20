import { PrismaClient } from "@prisma/client";
import { AdvConsole } from "../../advancedConsole";
import { CheckIfExists } from "./checkIfExists";
import { Create } from "./create";

type UpdateDefaultResponse = {
  success: true;
  info: string;
} | {
  success: false;
  error: string;
};

export class Update {
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

  async trackerChat (chatId: string, lastfmUsers: string[], option?: 'remove' | 'add' |'set' ): Promise<UpdateDefaultResponse> {
    const checkIfExists = await this.checkIfExists.trackerChat(chatId);
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error };
    if (!checkIfExists.exists) {
      const createTrackerChat = await this.create.trackerChat(chatId);
      if (!createTrackerChat.success) return { success: false, error: createTrackerChat.error };
    }
    for (let i = 0; i < lastfmUsers.length; i++) {
      const checkIfExists = await this.checkIfExists.trackingUser(lastfmUsers[i]);
      if (!checkIfExists.success) return { success: false, error: checkIfExists.error };
      if (!checkIfExists.exists) {
        const createTrackingUser = await this.create.trackingUser(lastfmUsers[i]);
        if (!createTrackingUser.success) return { success: false, error: createTrackingUser.error };
      }
    }
    const setTrackerChat = await this.prisma.trackerChats.update({
      where: {
        chatId: chatId
      },
      data: {
        trackingUsers: option === 'remove' ? {
          disconnect: [...lastfmUsers.map((lastfmUser) => {
            return {
              lastfmUser
            }
          })]
        } : option === 'add' ? {
          connect: [...lastfmUsers.map((lastfmUser) => {
            return {
              lastfmUser
            }
          })]
        } : option === 'set' ? {
          set: [...lastfmUsers.map((lastfmUser) => {
            return {
              lastfmUser
            }
          })]
        } : { // Default - SET
          set: [...lastfmUsers.map((lastfmUser) => {
            return {
              lastfmUser
            }
          })]
        }
      }
    }).catch((err) => {
      this.advConsole.error('Error while setting tracker chat! ChatId: ' + chatId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (setTrackerChat instanceof Error) return { success: false, error: setTrackerChat.message };
    return {
      success: true,
      info: 'Tracker chat set!'
    }
  }

  async telegramUser (telegramUserId: string, lastfmUser: string | null): Promise<UpdateDefaultResponse> {
    const checkIfExists = await this.checkIfExists.telegramUser(telegramUserId);
    if (!checkIfExists.success) return { success: false, error: checkIfExists.error };
    if (!checkIfExists.exists) {
      const createTelegramUser = await this.create.telegramUser(telegramUserId);
      if (!createTelegramUser.success) return { success: false, error: createTelegramUser.error };
    }
    const setTelegramUser = await this.prisma.telegramUsers.update({
      where: {
        telegramUserId: telegramUserId
      },
      data: {
        lastfmUser: lastfmUser,
        lastUpdate: new Date().getTime()
      }
    }).catch((err) => {
      this.advConsole.error('Error while setting telegram user! Telegram User Id: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });
    if (setTelegramUser instanceof Error) return { success: false, error: setTelegramUser.message };
    return {
      success: true,
      info: 'Telegram user set!'
    }
  }
}