import { DateTime } from 'luxon'
import fastify from 'fastify'
import { serverConfig } from '../config'
import { advError, advLog } from '../function/advancedConsole'
import { MelodyScoutLogBot } from '../MelodyScoutLog_Bot/bot'
import { MelodyScoutBot } from '../MelodyScout_Bot/bot'
const server = fastify()

export class Server {
  async start (melodyScoutLogBot: MelodyScoutLogBot, melodyScoutBot: MelodyScoutBot): Promise<void> {
    console.log('🟡 - Starting Server...')

    server.get('/', async (_request, reply) => {
      await reply.status(200).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScout - Running!`)
    })

    server.get('/health', async (_request, reply) => {
      await reply.status(200).send('OK')
    })

    server.get('/health/MelodyScoutBot', async (_request, reply) => {
      const botInfo = await melodyScoutBot.getBotInfo()
      if (!botInfo.success) {
        await reply.status(500).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutBot - Error: ${botInfo.error}`)
        return
      }
      await reply.status(200).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutBot - Running!\n\n${JSON.stringify(botInfo.botInfo, null, 2)}`)
    })

    server.get('/health/MelodyScoutLogBot', async (_request, reply) => {
      const botInfo = await melodyScoutLogBot.getBotInfo()
      if (!botInfo.success) {
        await reply.status(500).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutLogBot - Error: ${botInfo.error}`)
        return
      }
      await reply.status(200).send(`[${DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy - HH:mm:ss')}] MelodyScoutLogBot - Running!\n\n${JSON.stringify(botInfo.botInfo, null, 2)}`)
    })

    server.listen({
      port: serverConfig.port,
      host: serverConfig.host
    }, (err, address) => {
      if (err instanceof Error) {
        advError(`Server error: ${err.message}`)
        process.exit(1)
      }
      advLog(`Server listening at ${address}`)
    })

    console.log('🟢 - Server on!')
  }
}
