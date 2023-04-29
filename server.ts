import { DateTime } from 'luxon'
import fastify from 'fastify'
import config from './config'
const server = fastify()

export class Server {
  constructor () {
    console.log('🟢 - New server created!')
  }

  start (): void {
    console.log('🟢 - Server starting...')

    server.get('/', (_request, reply) => {
      void reply.send(`[${DateTime.now().setZone('America/Sao_Paulo').toJSON()}] MelodyScout - Running!`)
    })

    server.get('/health', (_request, reply) => {
      void reply.status(200).send('OK')
    })

    server.listen({ port: config.serverConfig.port, host: config.serverConfig.host }, (err, address) => {
      if (err !== null) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
    })

    console.log('🟢 - Server on!')
  }
}
