import axios from 'axios'
import { Album } from './classes/album'
import { Artist } from './classes/artist'
import { Track } from './classes/track'
import { User } from './classes/user'
import { ApiErrors } from './types/errors/ApiErrors'
import { AdvConsole } from '../../function/advancedConsole'

export class MsLastfmApi {
  private readonly advConsole: AdvConsole
  private readonly apiKey: string

  public album: Album
  public user: User
  public artist: Artist
  public track: Track

  constructor (advConsole: AdvConsole, apiKey: string) {
    this.advConsole = advConsole
    this.apiKey = apiKey

    this.album = new Album(advConsole, this.apiKey)
    this.user = new User(advConsole, this.apiKey)
    this.artist = new Artist(advConsole, this.apiKey)
    this.track = new Track(advConsole, this.apiKey)
  }

  async checkIfUserExists (username: string): Promise<{
    success: true
    exists: boolean
  } | ApiErrors> {
    const userInfo = await this.user.getInfo(username)
    if (!userInfo.success) {
      if (userInfo.errorType !== 'lfmApiError') {
        this.advConsole.error(`Error while checking if user exists in Last.fm! (errorType !== 'lfmApiError') Username: ${username} - Error: ${String(userInfo)}`)
        return userInfo
      }
      if (userInfo.errorData.error !== 6) {
        this.advConsole.error(`Error while checking if user exists in Last.fm! (errorData.error !== 6) Username: ${username} - Error: ${String(userInfo)}`)
        return userInfo
      }
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

  async getUserAboutMe (username: string): Promise<{
    success: true
    aboutMe: string
  } | ApiErrors> {
    const userPageResponse = await axios.get(`https://www.last.fm/user/${encodeURIComponent(username)}`).catch((err: any) => {
      return new Error(err)
    })
    if (userPageResponse instanceof Error) {
      this.advConsole.error(`Error getting user page for ${username} - Error: ${String(userPageResponse)}`)
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          error: -4,
          message: 'Error getting user page'
        }
      }
    }
    if (userPageResponse.status !== 200) {
      this.advConsole.error(`Error getting user page for ${username}, status code not 200 - Error: ${String(userPageResponse)}`)
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          error: -5,
          message: 'Error getting user page, status code not 200'
        }
      }
    }
    const userPage = userPageResponse.data
    if (userPage instanceof Error) {
      this.advConsole.error(`Error getting user page for ${username}, error getting text - Error: ${String(userPage)}`)
      return {
        success: false,
        errorType: 'msApiError',
        errorData: {
          error: -6,
          message: 'Error getting user page, error getting text'
        }
      }
    }
    const aboutMe = userPage.split('<section class="about-me-sidebar">')[1].split('</section>')[0].split('<p>')[1].split('</p>')[0]
    return {
      success: true,
      aboutMe
    }
  }
}
