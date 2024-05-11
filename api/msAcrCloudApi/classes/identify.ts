import { msApiFetch } from '../functions/msApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { zodIdentifyTrack, type IdentifyTrack } from '../types/zodIdentifyTrack'
import FormData from 'form-data'
import crypto from 'crypto'
import { advError } from '../../../functions/advancedConsole'

type IdentifyTrackResponse = {
  success: true
  data: IdentifyTrack
} | ApiErrors

export class Identify {
  private readonly accessKey: string
  private readonly secretKey: string

  constructor (accessKey: string, secretKey: string) {
    this.accessKey = accessKey
    this.secretKey = secretKey
  }

  async track (audio: Buffer): Promise<IdentifyTrackResponse> {
    console.log(this.accessKey, this.secretKey)
    const endpoint = '/v1/identify'
    const url = `https://identify-us-west-2.acrcloud.com/${endpoint}`
    const method = 'POST'
    const headers = undefined
    const signatureParams = {
      method,
      uri: endpoint,
      accessKey: this.accessKey,
      dataType: 'audio',
      signatureVersion: '1',
      timestamp: (Date.now() / 1000).toFixed(0)
    }
    const signatureString = [signatureParams.method, signatureParams.uri, signatureParams.accessKey, signatureParams.dataType, signatureParams.signatureVersion, signatureParams.timestamp].join('\n')
    const signature = crypto.createHmac('sha1', this.secretKey).update(Buffer.from(signatureString, 'utf-8')).digest().toString('base64')
    const form = new FormData()
    form.append('sample', audio)
    form.append('sample_bytes', audio.length)
    form.append('access_key', this.accessKey)
    form.append('data_type', signatureParams.dataType)
    form.append('signature_version', signatureParams.signatureVersion)
    form.append('signature', signature)
    form.append('timestamp', signatureParams.timestamp)
    const data = form
    const expectedZod = zodIdentifyTrack
    console.log('MsAcrCloudApi - Identify - Track - Searching for track...')
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, expectedZod)
    if (!msApiFetchResponse.success) {
      advError(`MsAcrCloudApi - Identify - Track - Error while searching for track: ${msApiFetchResponse.errorData.status.msg}`)
      return msApiFetchResponse
    }
    return {
      success: true,
      data: msApiFetchResponse.data
    }
  }
}
