import { AdvConsole } from '../../function/advancedConsole'
import { Authentication, EasyAuthResponse } from './classes/authentication'
import { GoogleApi } from './classes/googleApi'
import { RaveApi } from './classes/raveApi'

export class MsRaveApi {
  private readonly advConsole: AdvConsole

  public readonly authentication: Authentication
  public readonly easyAuth: Promise<EasyAuthResponse>

  public readonly googleApi: GoogleApi
  public readonly raveApi: RaveApi

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole

    this.googleApi = new GoogleApi(this.advConsole)

    this.authentication = new Authentication(this.googleApi)
    this.easyAuth = this.authentication.easyAuth()

    this.raveApi = new RaveApi(this.advConsole, this.easyAuth)
  }
}
