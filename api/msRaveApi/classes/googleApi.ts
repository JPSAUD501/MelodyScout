import { msApiFetch } from '../functions/msRaveApiFetch'
import { ApiErrors } from '../types/errors/ApiErrors'
import { AdvConsole } from '../../../function/advancedConsole'
import { GoogleNewUser, zodGoogleNewUser } from '../types/zodGoogleNewUser'

type NewUserResponse = {
  success: true
  data: GoogleNewUser
} | ApiErrors

export class GoogleApi {
  private readonly advConsole: AdvConsole

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole
  }

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
      this.advConsole.log(`Error while fetching Google new user! - Error: ${JSON.stringify(msApiFetchResponse.errorData)}`)
      return msApiFetchResponse
    }
    const userInfo = zodObject.parse(msApiFetchResponse.data)
    return {
      success: true,
      data: userInfo
    }
  }
}
