import { PrismaClient } from '@prisma/client'
import { AdvConsole } from "./advancedConsole";

type PrismaDbDefaultResponse = {
  success: true;
  info: string;
} | {
  success: false;
  error: string;
}

export class PrismaDB {
  advConsole: AdvConsole;
  prisma: PrismaClient;

  constructor (AdvConsole: AdvConsole) {
    this.advConsole = AdvConsole;
    this.prisma = new PrismaClient();

    this.advConsole.log("PrismaDB started!");
  }

  private async addNewChatIfNotExists (chatId: string): Promise<PrismaDbDefaultResponse> { 
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

    if (trackerChatExists) {
      this.advConsole.log("Chat al+ ready exi sts in database! ChatId: " + chatId);
      return {
        success: true,
        info: "Chat already exists in database!"
      }
    }

    const createdTrackerChat = await this.prisma.trackerChats.create({
      data: {
        chatId: chatId
      }
    }).catch((err) => {
      this.advConsole.error('Error while adding new chat to database! ChatId: ' + chatId);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (createdTrackerChat instanceof Error) return { success: false, error: createdTrackerChat.message}

    return {
      success: true,
      info: "Chat added to database!"
    }
  }

  async addNewUserToTrackInChat (chatId: string, lastfmUser: string): Promise<PrismaDbDefaultResponse> {
    const addNewChatIfNotExistsResult = await this.addNewChatIfNotExists(chatId)
    if (!addNewChatIfNotExistsResult.success) {
      return addNewChatIfNotExistsResult;
    }

    const updatedTrackerChat = await this.prisma.trackerChats.update({
      where: {
        chatId: chatId
      },
      data: {
        trackingUsers: {
          connectOrCreate: {
            where: {
              lastfmUser: lastfmUser
            },
            create: {
              lastfmUser: lastfmUser
            }
          }
        }
      }
    }).catch((err) => {
      this.advConsole.error('Error while adding new user to track in chat! ChatId: ' + chatId + ' | LastfmUser: ' + lastfmUser);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (updatedTrackerChat instanceof Error) return { success: false, error: updatedTrackerChat.message}

    return {
      success: true,
      info: "User added to track in chat!"
    }
  }

  async removeUserFromTrackInChat (chatId: string, lastfmUser: string): Promise<PrismaDbDefaultResponse> {
    const addNewChatIfNotExistsResult = await this.addNewChatIfNotExists(chatId)
    if (!addNewChatIfNotExistsResult.success) {
      return addNewChatIfNotExistsResult;
    }

    const updatedTrackerChat = await this.prisma.trackerChats.update({
      where: {
        chatId
      },
      data: {
        trackingUsers: {
          disconnect: {
            lastfmUser
          }
        }
      }
    }).catch((err) => {
      this.advConsole.error('Error while removing user from track in chat! ChatId: ' + chatId + ' | LastfmUser: ' + lastfmUser);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (updatedTrackerChat instanceof Error) return { success: false, error: updatedTrackerChat.message}

    return {
      success: true,
      info: "User removed from track in chat!"
    }
  }

  async getTrackListFromChat (chatId: string): Promise<{
    success: true;
    result: string[];
  } | {
    success: false;
    error: string;
  }> {
    const addNewChatIfNotExistsResult = await this.addNewChatIfNotExists(chatId)
    if (!addNewChatIfNotExistsResult.success) {
      return addNewChatIfNotExistsResult;
    }

    const trackerChat = await this.prisma.trackerChats.findUnique({
      where: {
        chatId
      },
      include: {
        trackingUsers: true
      }
    }).catch((err) => {
      this.advConsole.error('Error while getting track list from chat! ChatId: ' + chatId);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (trackerChat instanceof Error) return { success: false, error: trackerChat.message}

    if (!trackerChat) return { success: false, error: "Chat not found!"}

    const trackList = trackerChat.trackingUsers.map((user) => user.lastfmUser);

    return {
      success: true,
      result: trackList
    }
  }

  private async addNewUserDataIfNotExists (telegramUserId: string): Promise<{
    success: true;
    info: string;
  } | {
    success: false;
    error: string;
  }> {
    const userDataExists = await this.prisma.userData.findUnique({
      where: {
        telegramUserId
      }
    }).catch((err) => {
      this.advConsole.error('Error while checking if user data exists! TelegramUserId: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (userDataExists instanceof Error) return { success: false, error: userDataExists.message}

    if (userDataExists) {
      this.advConsole.log('User data already exists! TelegramUserId: ' + telegramUserId);
      return {
        success: true,
        info: "User data already exists!"
      }
    }

    const createdUserData = await this.prisma.userData.create({
      data: {
        telegramUserId
      }
    }).catch((err) => {
      this.advConsole.error('Error while creating user data! TelegramUserId: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (createdUserData instanceof Error) return { success: false, error: createdUserData.message}

    return {
      success: true,
      info: "User data created!"
    }
  }

  async linkTelegramUserToLastfmUser (telegramUserId: string, lastfmUser: string): Promise<PrismaDbDefaultResponse> {
    const addNewUserDataIfNotExistsResult = await this.addNewUserDataIfNotExists(telegramUserId)
    if (!addNewUserDataIfNotExistsResult.success) {
      return addNewUserDataIfNotExistsResult;
    }

    const telegramUser = await this.prisma.userData.update({
      where: {
        telegramUserId
      },
      data: {
        lastfmUser
      }
    }).catch((err) => {
      this.advConsole.error('Error while linking telegram user to lastfm user! TelegramUserId: ' + telegramUserId + ' | LastfmUser: ' + lastfmUser);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (telegramUser instanceof Error) return { success: false, error: telegramUser.message}

    return {
      success: true,
      info: "Telegram user linked to lastfm user!"
    }
  }

  async unlinkTelegramUserFromLastfmUser (telegramUserId: string): Promise<PrismaDbDefaultResponse> {
    const addNewUserDataIfNotExistsResult = await this.addNewUserDataIfNotExists(telegramUserId)
    if (!addNewUserDataIfNotExistsResult.success) {
      return addNewUserDataIfNotExistsResult;
    }

    const telegramUser = await this.prisma.userData.update({
      where: {
        telegramUserId
      },
      data: {
        lastfmUser: null
      }
    }).catch((err) => {
      this.advConsole.error('Error while unlinking telegram user from lastfm user! TelegramUserId: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (telegramUser instanceof Error) return { success: false, error: telegramUser.message}

    return {
      success: true,
      info: "Telegram user unlinked from lastfm user!"
    }
  }

  async getLastfmUserFromTelegramUser (telegramUserId: string): Promise<{
    success: true;
    registered: false;
  } | {
    success: true;
    registered: true;
    lastfmUser: string;
  } | {
    success: false;
    error: string;
  }> {
    const telegramUser = await this.prisma.userData.findUnique({
      where: {
        telegramUserId
      }
    }).catch((err) => {
      this.advConsole.error('Error while getting lastfm user from telegram user! TelegramUserId: ' + telegramUserId);
      this.advConsole.error(err);
      return new Error(err);
    });

    if (telegramUser instanceof Error) return { success: false, error: telegramUser.message}

    if (!telegramUser) return { success: true, registered: false }

    if (!telegramUser.lastfmUser) return { success: true, registered: false }

    return {
      success: true,
      registered: true,
      lastfmUser: telegramUser.lastfmUser
    }
  }
}