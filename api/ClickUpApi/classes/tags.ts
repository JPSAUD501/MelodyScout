import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { AddTagToTaskData, zodAddTagToTaskData } from '../types/zodAddTagToTaskData'

export type AddTagToTaskResponse = {
  success: true
  data: AddTagToTaskData
} | ApiErrors

export class Tags {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async addTagToTask (taskId: string, tagName: string): Promise<AddTagToTaskResponse> {
    const url = `https://api.clickup.com/api/v2/task/${taskId}/tag/${tagName}`
    const method = 'POST'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodAddTagToTaskData
    console.log(`Tags addTagToTask: taskId: ${taskId} tagName: ${tagName}`)
    console.log(`Tags addTagToTask: url: ${url}`)
    const clickUpApiFetchResponse = await ClickUpApiFetch(url, method, headers, data, zodObject)
    if (!clickUpApiFetchResponse.success) {
      return clickUpApiFetchResponse
    }
    const tasks = zodObject.parse(clickUpApiFetchResponse.data)

    return {
      success: true,
      data: tasks
    }
  }
}
