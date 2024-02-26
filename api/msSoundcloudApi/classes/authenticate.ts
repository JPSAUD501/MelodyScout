import { z } from 'zod'
import { advError } from '../../../functions/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import PromisePool from '@supercharge/promise-pool'

const clientIdCacheExpiration = 1000 * 60 * 60 * 1
const clientIdCache: {
  clientId: string
  expiration: number
} = {
  clientId: '',
  expiration: 0
}

type AuthenticateGetClientIdResponse = {
  success: true
  data: {
    clientId: string
  }
} | ApiErrors

export class Authenticate {
  async getClientId (): Promise<AuthenticateGetClientIdResponse> {
    if (clientIdCache.clientId.length > 0 && clientIdCache.expiration > Date.now()) {
      return {
        success: true,
        data: {
          clientId: clientIdCache.clientId
        }
      }
    }
    const url = 'https://soundcloud.com/search?q=melodyscout'
    const zodObject = z.string()
    const msApiFetchResponse = await msApiFetch(url, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`(MsSoundcloudApi) Error while fetching client id! Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const scriptSources = msApiFetchResponse.data.match(/<script crossorigin src="([^"]+)"/g)
    const scriptSourcesUrls: string[] = scriptSources.map((scriptSource: string) => {
      return scriptSource.split('src="')[1].split('"')[0].trim()
    })
    const scripts: string[] = []
    await new PromisePool()
      .for(scriptSourcesUrls)
      .withConcurrency(10)
      .process(async (scriptSourceUrl) => {
        const response = await msApiFetch(scriptSourceUrl, zodObject)
        if (response.success) {
          scripts.push(response.data)
        }
      })
    let finalClientId = ''
    for (const script of scripts) {
      if (script.includes('client_id:"')) {
        const clientId = script.split('client_id:"')[1].split('"')[0]
        if (clientId.length > 0) {
          finalClientId = clientId
          break
        }
      }
    }
    if (finalClientId.length > 0) {
      clientIdCache.clientId = finalClientId
      clientIdCache.expiration = Date.now() + clientIdCacheExpiration
      return {
        success: true,
        data: {
          clientId: finalClientId
        }
      }
    }
    return {
      success: false,
      errorType: 'soundcloudApiError',
      errorData: {
        message: 'Client id not found',
        error: -3
      }
    }
  }
}
