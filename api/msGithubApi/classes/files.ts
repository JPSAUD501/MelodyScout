import { advError } from '../../../function/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'
import { PutFile, zodPutFile } from '../types/zodPutFile'

type PutFileResponse = {
  success: true
  data: PutFile
} | ApiErrors

export class Files {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async putFile (fileName: string, fileData: string): Promise<PutFileResponse> {
    const url = `https://api.github.com/repos/JPSAUD501/MelodyScout-Files/contents/Images/${fileName}`
    const method = 'PUT'
    const headers = {
      Authorization: `Bearer ${this.apiKey}`
    }
    const data = {
      message: `${fileName}`,
      content: fileData
    }
    const zodObject = zodPutFile
    console.log(`PutFile - ${fileName}`)
    console.log(`PutFile - url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`PutFile - Error while uploading file ${fileName}: ${msApiFetchResponse.errorData.message}`)
      return msApiFetchResponse
    }
    const response = msApiFetchResponse.data
    return {
      success: true,
      data: response
    }
  }
}
