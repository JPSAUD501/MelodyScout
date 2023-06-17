import { GoogleApi } from './classes/googleApi'
import { RaveApi } from './classes/raveApi'

export class MsRaveApi {
  public readonly googleApi: GoogleApi
  public readonly raveApi: RaveApi

  constructor () {
    this.googleApi = new GoogleApi()
    this.raveApi = new RaveApi(this.googleApi)
  }
}
