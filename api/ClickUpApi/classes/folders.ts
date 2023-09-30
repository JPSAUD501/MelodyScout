import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { FolderData, zodFolderData } from '../types/zodFolderData'
import { FoldersData, zodFoldersData } from '../types/zodFoldersData'

export type GetFolderResponse = {
  success: true
  data: FolderData
} | ApiErrors

export type GetFoldersResponse = {
  success: true
  data: FoldersData
} | ApiErrors

export class Folders {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getFolder (spaceId: string): Promise<GetFolderResponse> {
    const url = `https://api.clickup.com/api/v2/space/${spaceId}/folder`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodFolderData
    console.log(`Folders getData: listId: ${spaceId}`)
    console.log(`Folders getData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async getFolders (spaceId: string): Promise<GetFoldersResponse> {
    const url = `https://api.clickup.com/api/v2/space/${spaceId}/folder`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodFoldersData
    console.log(`Folders getData: listId: ${spaceId}`)
    console.log(`Folders getData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }
}
