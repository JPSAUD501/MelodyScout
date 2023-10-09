import { DateTime } from 'luxon'
import fastify from 'fastify'
import { serverConfig } from '../config'
import { advError, advLog } from '../functions/advancedConsole'
import { type GetBotInfoResponse } from '../types'
const server = fastify()

export class Server {
  async start (getMelodyScoutLogBotInfo: () => Promise<GetBotInfoResponse>, getMelodyScoutBotInfo: () => Promise<GetBotInfoResponse>): Promise<void> {
    console.log('🟡 - Starting Server...')

    server.get('/', async (_request, reply) => {
      await reply.status(200).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScout - Running!`)
    })

    server.get('/health', async (_request, reply) => {
      await reply.status(200).send('OK')
    })

    server.get('/health/MelodyScoutBot', async (_request, reply) => {
      const botInfo = await getMelodyScoutBotInfo()
      if (!botInfo.success) {
        await reply.status(500).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutBot - Error: ${botInfo.error}`)
        return
      }
      await reply.status(200).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutBot - Running!\n\n${JSON.stringify(botInfo.botInfo, null, 2)}`)
    })

    server.get('/health/MelodyScoutLogBot', async (_request, reply) => {
      const botInfo = await getMelodyScoutLogBotInfo()
      if (!botInfo.success) {
        await reply.status(500).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutLogBot - Error: ${botInfo.error}`)
        return
      }
      await reply.status(200).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutLogBot - Running!\n\n${JSON.stringify(botInfo.botInfo, null, 2)}`)
    })

    server.listen({
      port: Number(serverConfig.port),
      host: serverConfig.host
    }, (err, address) => {
      if (err instanceof Error) {
        advError(`Server error: ${err.message}`)
        process.exit(2)
      }
      advLog(`Server listening at ${address}`)
    })

    console.log('🟢 - Server on!')
  }
}
