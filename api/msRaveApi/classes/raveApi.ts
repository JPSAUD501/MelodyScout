import { msApiFetch } from '../functions/msRaveApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'
import { AdvConsole } from '../../../function/advancedConsole'
import { EasyAuthResponse } from './authentication'
import { GetInfo, zodGetInfo } from '../types/zodGetInfo'
import { RaveContent, zodRaveContent } from '../types/zodRaveContent'

type GetInfoResponse = {
  success: true
  data: GetInfo
} | ApiErrors

type CreateContentResponse = {
  success: true
  data: RaveContent
} | ApiErrors

export class RaveApi {
  private readonly advConsole: AdvConsole
  private readonly easyAuth: Promise<EasyAuthResponse>

  constructor (advConsole: AdvConsole, easyAuth: Promise<EasyAuthResponse>) {
    this.advConsole = advConsole
    this.easyAuth = easyAuth
  }

  async getInfo (id: string): Promise<GetInfoResponse> {
    const easyAuth = await this.easyAuth
    if (!easyAuth.success) {
      return easyAuth
    }
    const authorizationToken = easyAuth.data.authorizationToken
    const url = `https://api.red.wemesh.ca/ravedj/content?id=${id}`
    const headers = {
      'Wemash-Plataform': 'Android',
      'Wemash-Api-Version': '5.0',
      'Client-Version': '5.0',
      Authorization: authorizationToken
    }
    const method = 'POST'
    const data = {
      returnSecureToken: true
    }
    const zodObject = zodGetInfo
    console.log(`RaveApi - getInfo - url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, zodObject)
    if (!msApiFetchResponse.success) {
      this.advConsole.log(`RaveApi - getInfo - Error while fetching! url: ${url} - Error: ${JSON.stringify(msApiFetchResponse, null, 2)}`)
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
    const easyAuth = await this.easyAuth
    if (!easyAuth.success) {
      return easyAuth
    }
    const authorizationToken = easyAuth.data.authorizationToken
    const url = 'https://api.red.wemesh.ca/ravedj/dj/self/content'
    const headers = {
      'Wemash-Plataform': 'Android',
      'Wemash-Api-Version': '5.0',
      'Client-Version': '5.0',
      Authorization: authorizationToken
    }
    const method = 'POST'
    const data = contentData
    const zodObject = zodRaveContent
    console.log(`RaveApi - createContent - url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, zodObject)
    if (!msApiFetchResponse.success) {
      this.advConsole.log(`RaveApi - createContent - Error while fetching! url: ${url} - Error: ${JSON.stringify(msApiFetchResponse, null, 2)}`)
      return msApiFetchResponse
    }
    const responseData = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: responseData
    }
  }
}
