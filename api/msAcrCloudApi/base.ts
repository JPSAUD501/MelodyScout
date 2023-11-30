import { Identify } from './classes/identify'

export class MsAcrCloudApi {
  private readonly accessKey: string
  private readonly secretKey: string

  public identify: Identify

  constructor (accessKey: string, secretKey: string) {
    this.accessKey = accessKey
    this.secretKey = secretKey

    this.identify = new Identify(this.accessKey, this.secretKey)
  }
}
