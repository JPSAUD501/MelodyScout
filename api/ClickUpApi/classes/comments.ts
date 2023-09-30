import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { CreateTaskCommentData, zodCreateTaskCommentData } from '../types/zodCommentData'

export type CreateTaskCommentResponse = {
  success: true
  data: CreateTaskCommentData
} | ApiErrors

export class Comments {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async createTaskComment (taskId: string, comment: string): Promise<CreateTaskCommentResponse> {
    const url = `https://api.clickup.com/api/v2/task/${taskId}/comment`
    const method = 'POST'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = {
      comment_text: comment,
      assignee: 0,
      notify_all: false
    }
    const zodObject = zodCreateTaskCommentData
    console.log(`Comments createTaskComment: taskId: ${taskId}`)
    console.log(`Comments createTaskComment: comment: ${comment}`)
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
