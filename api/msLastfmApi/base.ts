import { Album } from "./classes/album";
import { User } from "./classes/user";
import { ApiErrors } from "./types/errors/ApiErrors";

export class MsLastfmApi {
  private apiKey: string;
  
  public album: Album;
  public user: User;

  constructor(apiKey: string) {
    this.apiKey = apiKey;

    this.album= new Album(this.apiKey);
    this.user = new User(this.apiKey);
  }

  async checkIfUserExists(username: string): Promise<{
      success: true,
      exists: boolean
    } | ApiErrors> {
    const userInfo = await this.user.getInfo(username);
    if (!userInfo.success) {
      if (userInfo.errorType !== 'lfmApiError') return userInfo;
      if (userInfo.errorData.error !== 6) return userInfo;
      return {
        success: true,
        exists: false
      }
    }
    return {
      success: true,
      exists: true
    }
  }

  async getUserAboutMe(username: string): Promise<{
    success: true,
    aboutMe: string
  } | ApiErrors> {
    const userPageResponse = await fetch(`https://www.last.fm/user/${username}`).catch((err) => {
      return new Error(err);
    });
    if (userPageResponse instanceof Error) {
      console.error(`Error getting user page for ${username}`, userPageResponse);
      return {
        success: false,
        errorType: "msApiError",
        errorData: {
          error: -4,
          message: "Error getting user page"
        }
      }
    }
    if (userPageResponse.status !== 200) {
      console.error(`Error getting user page for ${username}, status code not 200`, userPageResponse);
      return {
        success: false,
        errorType: "msApiError",
        errorData: {
          error: -5,
          message: "Error getting user page, status code not 200"
        }
      }
    }
    const userPage = await userPageResponse.text().catch((err) => {
      console.error(`Error getting user page for ${username}, error getting text`, err);
      return new Error(err);
    });
    if (userPage instanceof Error) {
      console.error(`Error getting user page for ${username}, error getting text`, userPage);
      return {
        success: false,
        errorType: "msApiError",
        errorData: {
          error: -6,
          message: "Error getting user page, error getting text"
        }
      }
    }
    const aboutMe = `${userPage.split('<section class="about-me-sidebar">')[1].split('</section>')[0].split('<p>')[1].split('</p>')[0]}`;
    return {
      success: true,
      aboutMe
    }
  }
}