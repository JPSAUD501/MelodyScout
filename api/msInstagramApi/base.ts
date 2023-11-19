import { advError } from '../../functions/advancedConsole'
import { type AccountRepositoryLoginResponseLogged_in_user, IgApiClient, type PostingStoryPhotoOptions, type PostingStoryVideoOptions } from 'instagram-private-api'
import { zodPostStory } from './types/zodPostStory'
import { instagramConfig } from '../../config'

interface MsInstagramApiError {
  success: false
  error: string
}

type MsInstagramPostStoryResponse = {
  success: true
  postUrl: string
} | MsInstagramApiError

const igBaseClient: {
  client: IgApiClient
  loggedInUser: AccountRepositoryLoginResponseLogged_in_user | undefined
} = {
  client: new IgApiClient(),
  loggedInUser: undefined
}
async function getIgClient (): Promise<{
  success: true
  igClient: {
    client: IgApiClient
    loggedInUser: AccountRepositoryLoginResponseLogged_in_user
  }
} | MsInstagramApiError> {
  if (igBaseClient.loggedInUser !== undefined) {
    return {
      success: true,
      igClient: {
        client: igBaseClient.client,
        loggedInUser: igBaseClient.loggedInUser
      }
    }
  }
  igBaseClient.client.state.generateDevice(instagramConfig.username)
  await igBaseClient.client.simulate.preLoginFlow().catch((err) => {
    return new Error(err)
  })
  const loginResponse = await igBaseClient.client.account.login(instagramConfig.username, instagramConfig.password).catch((err) => {
    return new Error(err)
  })
  if (loginResponse instanceof Error) {
    advError(`MsInstagramApi - getIgLoggedInUser - Error on login: ${loginResponse.message}`)
    return {
      success: false,
      error: loginResponse.message
    }
  }
  igBaseClient.loggedInUser = loginResponse
  return {
    success: true,
    igClient: {
      client: igBaseClient.client,
      loggedInUser: igBaseClient.loggedInUser
    }
  }
}

export class MsInstagramApi {
  async postStory (options: PostingStoryPhotoOptions | PostingStoryVideoOptions): Promise<MsInstagramPostStoryResponse> {
    try {
      const igClientResponse = await getIgClient()
      if (!igClientResponse.success) {
        return {
          success: false,
          error: igClientResponse.error
        }
      }
      const igClient = igClientResponse.igClient
      const publishResponse = await igClient.client.publish.story(options).catch((err) => {
        return new Error(err)
      })
      if (publishResponse instanceof Error) {
        advError(`MsInstagramApi - postStory - Error on publishing story: ${publishResponse.message}`)
        return {
          success: false,
          error: publishResponse.message
        }
      }
      let postUrl = `https://instagram.com/stories/${igClient.loggedInUser.username}/`
      const postStoryResponseParsed = zodPostStory.safeParse(publishResponse)
      if (postStoryResponseParsed.success) {
        postUrl = `https://instagram.com/stories/${igClient.loggedInUser.username}/${postStoryResponseParsed.data.media.pk}`
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
