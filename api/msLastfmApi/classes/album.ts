import { AlbumInfo, zodAlbumInfo } from "../types/zodAlbumInfo";
import { msApiFetch } from "../functions/msApiFetch";
import { ApiErrors } from "../types/errors/ApiErrors";

type getInfoResponse = {
    success: true,
    data: AlbumInfo
  } | ApiErrors

export class Album {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getInfo(artist: string, album: string, mbid: string, username: string): Promise<getInfoResponse> {
    const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${this.apiKey}&artist=${artist}&album=${album}&mbid=${mbid}&username=${username}&format=json`;
    const zodObject = zodAlbumInfo;
    
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