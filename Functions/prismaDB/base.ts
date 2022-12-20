import { PrismaClient } from '@prisma/client'
import { AdvConsole } from "../advancedConsole";
import { CheckIfExists } from './classes/checkIfExists';
import { Create } from './classes/create';
import { Get } from './classes/get';
import { Update } from './classes/update';

export class PrismaDB {
  private advConsole: AdvConsole;
  private prisma: PrismaClient;

  checkIfExists: CheckIfExists;
  create: Create;
  get: Get;
  update: Update;

  constructor (AdvConsole: AdvConsole) {
    this.advConsole = AdvConsole;
    this.prisma = new PrismaClient();

    this.checkIfExists = new CheckIfExists(this.advConsole, this.prisma);
    this.create = new Create(this.advConsole, this.prisma);
    this.get = new Get(this.advConsole, this.prisma, this.checkIfExists, this.create);
    this.update = new Update(this.advConsole, this.prisma, this.checkIfExists, this.create);

    this.advConsole.log("PrismaDB started!");
  }

}