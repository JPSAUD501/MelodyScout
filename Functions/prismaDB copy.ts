import { PrismaClient } from '@prisma/client'
import { AdvConsole } from "./advancedConsole";

type PrismaDBDefaultResponse = {
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

  private async checkIfTrackerChatExists (chatId: string): Promise<PrismaDBDefaultResponse> {
    
  }
}