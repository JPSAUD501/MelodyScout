import { ClickUpApiFetch } from '../functions/apiFetch'
import { ApiErrors } from '../types/errors/apiErrors'
import { SpaceData, zodSpaceData } from '../types/zodSpaceData'

export type GetSpaceResponse = {
  success: true
  data: SpaceData
} | ApiErrors

export class Spaces {
  private readonly apiKey: string

  constructor (apiKey: string) {
    this.apiKey = apiKey
  }

  async getSpace (spaceId: string): Promise<GetSpaceResponse> {
    const url = `https://api.clickup.com/api/v2/space/${spaceId}`
    const method = 'GET'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: this.apiKey
    }
    const data = undefined
    const zodObject = zodSpaceData
    console.log(`Spaces getData: listId: ${spaceId}`)
    console.log(`Spaces getData: url: ${url}`)
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
