import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { UpdateCustomFieldData, zodUpdateCustomFieldData } from '../types/zodUpdateCustomFieldData'

export type SetCustomFieldResponse = {
  success: true
  data: UpdateCustomFieldData
} | ApiErrors

export class CustomFields {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async setCustomFieldValue (taskId: string, fieldId: string, fieldData: {
    value: number | string
    value_options?: {
      time: boolean
    }
  }): Promise<SetCustomFieldResponse> {
    const url = `https://api.clickup.com/api/v2/task/${taskId}/field/${fieldId}`
    const method = 'POST'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = fieldData
    const zodObject = zodUpdateCustomFieldData
    console.log(`CustomFields setCustomFieldValue: taskId: ${taskId}, fieldId: ${fieldId}`)
    console.log(`CustomFields setCustomFieldValue: url: ${url}`)

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
