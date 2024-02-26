import axios from 'axios'
import { advError } from '../../../functions/advancedConsole'
import { type Search } from './search'
import z from 'zod'
import { type Authenticate } from './authenticate'

type PreviewTrackResponse = {
  success: true
  data: {
    tempSmallPreviewUrl: string
    base64FullPreview: Buffer
  }
} | {
  success: false
  error: string
}

export class Preview {
  private readonly authenticate: Authenticate
  private readonly search: Search

  constructor (authenticate: Authenticate, search: Search) {
    this.authenticate = authenticate
    this.search = search
  }

  async getFrom (trackName: string, artistName: string): Promise<PreviewTrackResponse> {
    try {
      const scTrack = await this.search.track(trackName, artistName, 1)
      if (!scTrack.success) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${JSON.stringify(scTrack.errorData)}`)
        return {
          success: false,
          error: 'Error while fetching preview track'
        }
      }
      if (scTrack.data.collection.length <= 0) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: Track not founded`)
        return {
          success: false,
          error: 'Track not founded'
        }
      }
      const track = scTrack.data.collection[0]
      if (track.media === null || track.media === undefined) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: Track media not founded`)
        return {
          success: false,
          error: 'Track media not founded'
        }
      }
      if (track.media.transcodings.length <= 0) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: Track preview url not founded`)
        return {
          success: false,
          error: 'Track preview url not founded'
        }
      }
      const getClientIdResponse = await this.authenticate.getClientId()
      if (!getClientIdResponse.success) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${JSON.stringify(getClientIdResponse.errorData)}`)
        return {
          success: false,
          error: 'Error while getting client id'
        }
      }
      const mediaUrl = track.media.transcodings[0].url
      const mediaUrlResponse = await axios({
        method: 'GET',
        url: `${mediaUrl}?client_id=${getClientIdResponse.data.clientId}`
      }).catch((err) => {
        return new Error(err)
      })
      if (mediaUrlResponse instanceof Error) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${String(mediaUrlResponse)}`)
        return {
          success: false,
          error: 'Error while fetching preview track'
        }
      }
      const mediaUrlResponseParsed = z.object({
        url: z.string()
      }).safeParse(mediaUrlResponse.data)
      if (!mediaUrlResponseParsed.success) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${JSON.stringify(mediaUrlResponseParsed.error)}`)
        return {
          success: false,
          error: 'Error while fetching preview track'
        }
      }
      const m3u8Url = mediaUrlResponseParsed.data.url
      const m3u8Response = await axios({
        method: 'GET',
        url: m3u8Url,
        responseType: 'text'
      }).catch((err) => {
        return new Error(err)
      })
      if (m3u8Response instanceof Error) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${String(m3u8Response)}`)
        return {
          success: false,
          error: 'Error while fetching preview track'
        }
      }
      const m3u8ResponseParsed = z.string().safeParse(m3u8Response.data)
      if (!m3u8ResponseParsed.success) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${JSON.stringify(m3u8ResponseParsed.error)}`)
        return {
          success: false,
          error: 'Error while fetching preview track'
        }
      }
      const m3u8 = m3u8ResponseParsed.data
      const m3u8Lines = m3u8.split('\n')
      const m3u8Parts: Array<{
        duration: number
        url: string
      }> = []
      let line = 0
      for (const m3u8Line of m3u8Lines) {
        if (m3u8Line.startsWith('#EXTINF:')) {
          const duration = Number(m3u8Line.split('#EXTINF:')[1].split(',')[0])
          const url = m3u8Lines[line + 1]
          m3u8Parts.push({
            duration,
            url
          })
        }
        line++
      }
      if (m3u8Parts.length <= 0) {
        advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: M3u8 parts not founded`)
        return {
          success: false,
          error: 'Error while fetching preview track'
        }
      }
      const previewMaxDuration = 30
      const fullMediaDuration = m3u8Parts.reduce((acc, cur) => {
        return acc + cur.duration
      }, 0)
      const fullMediaMiddleIndex = Math.floor(fullMediaDuration / 2)
      const previewStartIndex = fullMediaMiddleIndex - (previewMaxDuration / 2) < 0 ? 0 : fullMediaMiddleIndex - (previewMaxDuration / 2)
      const fullMediaParsedParts: Array<{
        start: number
        duration: number
        url: string
      }> = []
      for (const m3u8Part of m3u8Parts) {
        let duration = 0
        for (const fullMediaParsedPart of fullMediaParsedParts) {
          duration += fullMediaParsedPart.duration
        }
        fullMediaParsedParts.push({
          start: duration,
          duration: m3u8Part.duration,
          url: m3u8Part.url
        })
      }
      const previewParts: Array<{
        start: number
        duration: number
        url: string
      }> = []
      for (const fullMediaParsedPart of fullMediaParsedParts) {
        if (fullMediaParsedPart.start >= previewStartIndex && fullMediaParsedPart.start <= previewStartIndex + previewMaxDuration) {
          previewParts.push(fullMediaParsedPart)
        }
      }
      const longestPreviewPart = previewParts.reduce((acc, cur) => {
        return acc.duration > cur.duration ? acc : cur
      })
      const tempSmallPreviewUrl = longestPreviewPart.url
      const previewUrls: string[] = []
      for (const previewPart of previewParts) {
        previewUrls.push(previewPart.url)
      }
      const previewUrlsRequests = previewUrls.map(async (url) => {
        return await axios({
          method: 'GET',
          url,
          responseType: 'arraybuffer'
        }).catch((err) => {
          return new Error(err)
        })
      })
      const previewUrlsResponses = await Promise.all(previewUrlsRequests)
      const base64PreviewParts: Buffer[] = []
      for (const previewUrlsResponse of previewUrlsResponses) {
        if (previewUrlsResponse instanceof Error) {
          advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${String(previewUrlsResponse)}`)
          return {
            success: false,
            error: 'Error while fetching preview track'
          }
        }
        if (previewUrlsResponse.data === null) {
          advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: Full preview url response data is null`)
          return {
            success: false,
            error: 'Error while fetching preview track'
          }
        }
        if (!(previewUrlsResponse.data instanceof Buffer)) {
          advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: Full preview url response data is not a buffer`)
          return {
            success: false,
            error: 'Error while fetching preview track'
          }
        }
        base64PreviewParts.push(previewUrlsResponse.data)
      }
      const base64Preview = Buffer.concat(base64PreviewParts)
      return {
        success: true,
        data: {
          tempSmallPreviewUrl,
          base64FullPreview: base64Preview
        }
      }
    } catch (err) {
      advError(`(MsSoundcloudApi) Error while fetching preview track! Track: ${trackName} - ${artistName} - Error: ${String(err)}`)
      return {
        success: false,
        error: 'Error while fetching preview track'
      }
    }
  }
}
