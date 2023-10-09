import { PrismaClient } from '@prisma/client'
import { CheckIfExists } from './classes/checkIfExists'
import { Create } from './classes/create'
import { Get } from './classes/get'
import { Update } from './classes/update'
import { advLog } from '../../functions/advancedConsole'

export class MsPrismaDbApi {
  private readonly prisma: PrismaClient

  checkIfExists: CheckIfExists
  create: Create
  get: Get;
  update: Update

  constructor () {
    this.prisma = new PrismaClient()

    this.checkIfExists = new CheckIfExists(this.prisma)
    this.create = new Create(this.prisma)
    this.get = new Get(this.prisma)
    this.update = new Update(this.prisma, this.checkIfExists, this.create)

    advLog('MsPrismaDbApi started!')
  }
}
