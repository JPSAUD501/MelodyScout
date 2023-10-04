import { Files } from './classes/files'

export class MsLastfmApi {
  private readonly apiKey: string

  public files: Files

  constructor (apiKey: string) {
    this.apiKey = apiKey

    this.files = new Files(this.apiKey)
  }
}
