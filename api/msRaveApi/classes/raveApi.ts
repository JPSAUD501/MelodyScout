import { msApiFetch } from '../functions/msRaveApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { type CreateContent, zodCreateContent } from '../types/zodCreateContent'
import { type GetContent, zodGetContent } from '../types/zodGetContent'
import { type GoogleApi } from './googleApi'
import { easyAuth } from '../functions/easyAuth'
import { advError } from '../../../functions/advancedConsole'

type GetInfoResponse = {
  success: true
  data: GetContent
} | ApiErrors

type CreateContentResponse = {
  success: true
  data: CreateContent
} | ApiErrors

export class RaveApi {
  private readonly googleApi: GoogleApi

  constructor (googleApi: GoogleApi) {
    this.googleApi = googleApi
  }

  async getInfo (id: string): Promise<GetInfoResponse> {
    const easyAuthResponse = await easyAuth(this.googleApi)
    if (!easyAuthResponse.success) {
      return easyAuthResponse
    }
    const authorizationToken = easyAuthResponse.data.authorizationToken
    const url = `https://api.red.wemesh.ca/ravedj/content?id=${id}`
    const headers = {
      'Wemesh-Platform': 'Android',
      'Wemesh-Api-Version': '5.0',
      'Client-Version': '5.0',
      Authorization: authorizationToken
    }
    const method = 'GET'
    const data = {
      returnSecureToken: true
    }
    const zodObject = zodGetContent
    console.log(`RaveApi - getInfo - url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`RaveApi - getInfo - Error while fetching! url: ${url} - Error: ${JSON.stringify(msApiFetchResponse, null, 2)}`)
      return msApiFetchResponse
    }
    const responseData = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: responseData
    }
  }

  async createContent (contentData: {
    style: 'MASHUP' | 'MIX'
    tittle: string | null
    media: Array<{
      provider: 'YOUTUBE'
      providerId: string
    }>
  }): Promise<CreateContentResponse> {
    const easyAuthResponse = await easyAuth(this.googleApi)
    if (!easyAuthResponse.success) {
      return easyAuthResponse
    }
    const authorizationToken = easyAuthResponse.data.authorizationToken
    const url = 'https://api.red.wemesh.ca/ravedj/dj/self/content'
    const headers = {
      'Wemesh-Platform': 'Android',
      'Wemesh-Api-Version': '5.0',
      'Client-Version': '5.0',
      Authorization: authorizationToken
    }
    const method = 'POST'
    const data = contentData
    const zodObject = zodCreateContent
    console.log(`RaveApi - createContent - url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`RaveApi - createContent - Error while fetching! url: ${url} - Error: ${JSON.stringify(msApiFetchResponse, null, 2)}`)
      return msApiFetchResponse
    }
    const responseData = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: responseData
    }
  }
}
