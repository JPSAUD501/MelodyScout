import FormData from 'form-data'
import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { CreateTaskAttachmentData, zodCreateTaskAttachmentData } from '../types/zodCreateTaskAttachmentData'

export type CreateTaskAttachmentResponse = {
  success: true
  data: CreateTaskAttachmentData
} | ApiErrors

export class Attachments {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async createTaskAttachment (taskId: string, file: Buffer, fileName: string): Promise<CreateTaskAttachmentResponse> {
    const url = `https://api.clickup.com/api/v2/task/${taskId}/attachment`
    const method = 'POST'
    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: this.apiKey
    }
    const form = new FormData()
    form.append('attachment', file, {
      filename: fileName
    })
    const data = form
    const zodObject = zodCreateTaskAttachmentData
    console.log(`Attachments createTaskAttachment: taskId: ${taskId}`)

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
