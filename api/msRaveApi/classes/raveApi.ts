import { msApiFetch } from '../functions/msRaveApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'
import { AdvConsole } from '../../../function/advancedConsole'
import { CreateContent, zodCreateContent } from '../types/zodCreateContent'
import { GetContent, zodGetContent } from '../types/zodGetContent'
import { GoogleApi } from './googleApi'
import { easyAuth } from '../functions/easyAuth'

type GetInfoResponse = {
  success: true
  data: GetContent
} | ApiErrors

type CreateContentResponse = {
  success: true
  data: CreateContent
} | ApiErrors

export class RaveApi {
  private readonly advConsole: AdvConsole
  private readonly googleApi: GoogleApi

  constructor (advConsole: AdvConsole, googleApi: GoogleApi) {
    this.advConsole = advConsole
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
      this.advConsole.error(`RaveApi - getInfo - Error while fetching! url: ${url} - Error: ${JSON.stringify(msApiFetchResponse, null, 2)}`)
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
      this.advConsole.error(`RaveApi - createContent - Error while fetching! url: ${url} - Error: ${JSON.stringify(msApiFetchResponse, null, 2)}`)
      return msApiFetchResponse
    }
    const responseData = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: responseData
    }
  }
}
