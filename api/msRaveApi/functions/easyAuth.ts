import { ApiErrors } from '../types/errors/ApiErrors'
import { GoogleApi } from '../classes/googleApi'

export type EasyAuthResponse = {
  success: true
  data: {
    authorizationToken: string
  }
} | ApiErrors

export async function easyAuth (googleApi: GoogleApi): Promise<EasyAuthResponse> {
  const googleNewUserResponse = await googleApi.newUser()
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
