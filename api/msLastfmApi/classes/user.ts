import { msApiFetch } from "../functions/msApiFetch";
import { ApiErrors } from "../types/errors/ApiErrors";
import { UserInfo, zodUserInfo } from "../types/zodUserInfo";


type getInfoResponse = {
    success: true,
    data: UserInfo
  } | ApiErrors

export class User {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getInfo(username: string): Promise<getInfoResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${this.apiKey}&format=json`;
    const zodObject = zodUserInfo;

    const msApiFetchResponse = await msApiFetch(url, zodObject);
    if (!msApiFetchResponse.success) {
      return msApiFetchResponse;
    }
    const userInfo = zodObject.parse(msApiFetchResponse.data);
    return {
      success: true,
      data: userInfo
    }
  }
}