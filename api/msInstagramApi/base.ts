import { advError } from '../../functions/advancedConsole'
import { IgApiClient, type PostingStoryPhotoOptions, type PostingStoryVideoOptions } from 'instagram-private-api'
import { zodPostStory } from './types/zodPostStory'

interface MsInstagramApiError {
  success: false
  error: string
}

type MsInstagramPostStoryResponse = {
  success: true
  postUrl: string
} | MsInstagramApiError

export class MsInstagramApi {
  private readonly igClient: IgApiClient
  private readonly username: string
  private readonly password: string

  constructor (username: string, password: string) {
    this.username = username
    this.password = password
    this.igClient = new IgApiClient()
    this.igClient.state.generateDevice(username)
  }

  async postStory (options: PostingStoryPhotoOptions | PostingStoryVideoOptions): Promise<MsInstagramPostStoryResponse> {
    try {
      await this.igClient.simulate.preLoginFlow().catch((err) => {
        return new Error(err)
      })
      const loginResponse = await this.igClient.account.login(this.username, this.password).catch((err) => {
        return new Error(err)
      })
      if (loginResponse instanceof Error) {
        advError(`MsInstagramApi - postStory - Error on login: ${loginResponse.message}`)
        return {
          success: false,
          error: loginResponse.message
        }
      }
      const publishResponse = await this.igClient.publish.story(options).catch((err) => {
        return new Error(err)
      })
      if (publishResponse instanceof Error) {
        advError(`MsInstagramApi - postStory - Error on publishing story: ${publishResponse.message}`)
        return {
          success: false,
          error: publishResponse.message
        }
      }
      let postUrl = `https://instagram.com/stories/${this.username}/`
      const postStoryResponseParsed = zodPostStory.safeParse(publishResponse)
      if (postStoryResponseParsed.success) {
        postUrl = `https://instagram.com/stories/${this.username}/${postStoryResponseParsed.data.media.pk}`
      }
      return {
        success: true,
        postUrl
      }
    } catch (err) {
      advError(`MsInstagramApi - postStory - Error: ${String(err)}`)
      return {
        success: false,
        error: String(err)
      }
    }
  }
}
