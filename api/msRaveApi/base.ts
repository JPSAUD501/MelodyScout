import { AdvConsole } from '../../function/advancedConsole'
import { GoogleApi } from './classes/googleApi'
import { RaveApi } from './classes/raveApi'

export class MsRaveApi {
  private readonly advConsole: AdvConsole

  public readonly googleApi: GoogleApi
  public readonly raveApi: RaveApi

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole

    this.googleApi = new GoogleApi(this.advConsole)
    this.raveApi = new RaveApi(this.advConsole, this.googleApi)
  }
}
