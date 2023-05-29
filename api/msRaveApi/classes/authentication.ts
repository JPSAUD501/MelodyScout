import { ApiErrors } from '../types/errors/ApiErrors'
import { GoogleApi } from './googleApi'

export type EasyAuthResponse = {
  success: true
  data: {
    authorizationToken: string
  }
} | ApiErrors

export class Authentication {
  private readonly googleApi: GoogleApi

  constructor (googleApi: GoogleApi) {
    this.googleApi = googleApi
  }

  async easyAuth (): Promise<EasyAuthResponse> {
    const googleNewUserResponse = await this.googleApi.newUser()
    if (!googleNewUserResponse.success) {
      return googleNewUserResponse
    }
    return {
      success: true,
      data: {
        authorizationToken: `bearer ${googleNewUserResponse.data.idToken}`
      }
    }
  }
}
