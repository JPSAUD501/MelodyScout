import { DateTime } from 'luxon'
import fastify from 'fastify'
import { AdvConsole } from '../function/advancedConsole'
import { serverConfig } from '../config'
const server = fastify()

export class Server {
  advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

  async start (): Promise<void> {
    console.log('🟢 - Health Checker On!')

    server.get('/', async (_request, reply) => {
      await reply.send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutBot - Running!`)
    })

    server.get('/health', async (_request, reply) => {
      await reply.status(200).send('OK')
    })

    server.listen({
      port: serverConfig.port,
      host: serverConfig.host
    }, (err, address) => {
      if (err instanceof Error) {
        this.advConsole.error(`Server error: ${err.message}`)
        process.exit(1)
      }
      this.advConsole.log(`Server listening at ${address}`)
    })
  }
}
