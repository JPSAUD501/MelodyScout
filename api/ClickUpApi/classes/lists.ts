import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { ListData, zodListData } from '../types/zodListData'
import { ListsData, zodListsData } from '../types/zodListsData'

export type GetListResponse = {
  success: true
  data: ListData
} | ApiErrors

export type GetListsResponse = {
  success: true
  data: ListsData
} | ApiErrors

export type GetFolderlessListsResponse = {
  success: true
  data: ListsData
} | ApiErrors

export type UpdateListResponse = {
  success: true
  data: ListData
} | ApiErrors

export class Lists {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getList (listId: string): Promise<GetListResponse> {
    const url = `https://api.clickup.com/api/v2/list/${listId}`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodListData
    console.log(`Lists getData: listId: ${listId}`)
    console.log(`Lists getData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async updateList (listId: string, newListData: ListData): Promise<UpdateListResponse> {
    const url = `https://api.clickup.com/api/v2/list/${listId}`
    const method = 'PUT'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = {
      name: newListData.name,
      content: newListData.content,
      due_date: Number(newListData.due_date),
      due_date_time: newListData.due_date !== '',
      priority: newListData.priority !== null ? Number(newListData.priority.priority) : null,
      assignee: 'none',
      status: newListData.status?.status,
      unset_status: false
    }
    const zodObject = zodListData
    console.log(`Lists updateData: listId: ${listId}`)
    console.log(`Lists updateData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async getFolderlessLists (spaceId: string): Promise<GetFolderlessListsResponse> {
    const url = `https://api.clickup.com/api/v2/space/${spaceId}/list`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodListsData
    console.log(`Lists getData: spaceId: ${spaceId}`)
    console.log(`Lists getData: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    return {
      success: true,
      data: zodObject.parse(clickUpApiFetchResponse.data)
    }
  }

  async getLists (folderId: string): Promise<GetListsResponse> {
    const url = `https://api.clickup.com/api/v2/folder/${folderId}/list`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodListsData
    console.log(`Lists getData: folderId: ${folderId}`)
    console.log(`Lists getData: url: ${url}`)
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
