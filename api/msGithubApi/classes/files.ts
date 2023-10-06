import { z } from 'zod'
import { advError, advLog } from '../../../function/advancedConsole'
import { msApiFetch } from '../functions/msApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { type PutFile, zodPutFile } from '../types/zodPutFile'

type GetFileResponse = {
  success: true
} | ApiErrors

type PutFileResponse = {
  success: true
  data: PutFile
} | ApiErrors

export class Files {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  private async getFilePreview (fileUrl: string): Promise<GetFileResponse> {
    const url = fileUrl
    const method = 'GET'
    const headers = undefined
    const data = undefined
    const expectedZod = z.string()
    console.log(`GetFile - url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, expectedZod)
    if (!msApiFetchResponse.success) {
      return msApiFetchResponse
    }
    return {
      success: true
    }
  }

  async putFile (fileName: string, fileData: string): Promise<PutFileResponse> {
    const url = `https://api.github.com/repos/JPSAUD501/MelodyScout-Files/contents/Images/${encodeURI(fileName)}`
    const method = 'PUT'
    const headers = {
      Authorization: `Bearer ${this.apiKey}`
    }
    const data = {
      message: `${fileName}`,
      content: fileData
    }
    const expectedZod = zodPutFile
    console.log(`PutFile - ${fileName}`)
    console.log(`PutFile - url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, expectedZod)
    if (!msApiFetchResponse.success) {
      advError(`PutFile - Error while uploading file ${fileName}: ${msApiFetchResponse.errorData.message}`)
      return msApiFetchResponse
    }
    const response = msApiFetchResponse.data
    const maxTimeAfterUpload = 120000
    const uploadTime = new Date().getTime()
    let getFilePreviewResponse: GetFileResponse
    do {
      getFilePreviewResponse = await this.getFilePreview(response.content.download_url)
      if (getFilePreviewResponse.success) {
        advLog(`PutFile - Uploaded file time: ${new Date().getTime() - uploadTime}ms / ${(new Date().getTime() - uploadTime) / 1000}s`)
        return {
          success: true,
          data: response
        }
      }
    } while (!getFilePreviewResponse.success && new Date().getTime() - uploadTime < maxTimeAfterUpload)
    advError(`PutFile - Error while getting file preview ${fileName}: ${getFilePreviewResponse.errorData.message}`)
    return getFilePreviewResponse
  }
}
