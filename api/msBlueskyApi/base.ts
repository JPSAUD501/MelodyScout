import { blueskyConfig } from '../../config'
import { advError } from '../../functions/advancedConsole'
import { AtpAgent, RichText } from '@atproto/api'

interface MsBlueskyApiError {
  success: false
  error: string
}

type MsBlueskyPostResponse = {
  success: true
  postUrl: string
} | MsBlueskyApiError

export class MsBlueskyApi {
  async post (text: string, postImage: Buffer, postImageAlt: string): Promise<MsBlueskyPostResponse> {
    try {
      const agent = new AtpAgent({
        service: 'https://bsky.social'
      })
      await agent.login({
        identifier: blueskyConfig.username,
        password: blueskyConfig.password
      })
      const imageBlob = await agent.uploadBlob(postImage)
      const richText = new RichText({ text })
      await richText.detectFacets(agent)
      const post = await agent.post({
        $type: 'app.bsky.feed.post',
        text: richText.text,
        facets: richText.facets,
        embed: {
          $type: 'app.bsky.embed.images',
          images: [
            {
              alt: postImageAlt,
              image: imageBlob.data.blob
            }
          ]
        }
      })
      const postId = post.uri.split('/').pop()
      if (postId === undefined) {
        throw new Error('postId is undefined')
      }
      return {
        success: true,
        postUrl: `https://bsky.app/profile/${'melodyscout.bsky.social'}/post/${postId}`
      }
    } catch (err) {
      advError(`MsBlueskyApi - post - Error on post: ${String(err)}`)
      return {
        success: false,
        error: String(err)
      }
    }
  }
}
