import { advError } from '../../../functions/advancedConsole'
import { msApiFetch } from '../functions/msRaveApiFetch'
import { type ApiErrors } from '../types/errors/ApiErrors'
import { type GoogleNewUser, zodGoogleNewUser } from '../types/zodGoogleNewUser'

type NewUserResponse = {
  success: true
  data: GoogleNewUser
} | ApiErrors

export class GoogleApi {
  async newUser (): Promise<NewUserResponse> {
    const url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyCB24TzTgYXl4sXwLyeY8y-XXgm0RX_eRQ'
    const method = 'POST'
    const headers = {
      Referer: 'https://rave.dj/'
    }
    const data = {
      returnSecureToken: true
    }
    const zodObject = zodGoogleNewUser
    console.log(`Google newUser: url: ${url}`)
    const msApiFetchResponse = await msApiFetch(url, method, headers, data, zodObject)
    if (!msApiFetchResponse.success) {
      advError(`Error while fetching Google new user! - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userInfo = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userInfo
    }
  }
}
