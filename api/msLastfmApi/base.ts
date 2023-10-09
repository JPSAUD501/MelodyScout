import axios from 'axios'
import { Album } from './classes/album'
import { Artist } from './classes/artist'
import { Track } from './classes/track'
import { User } from './classes/user'
import { type ApiErrors } from './types/errors/ApiErrors'
import { advError } from '../../functions/advancedConsole'

export class MsLastfmApi {
  private readonly apiKey: string

  public album: Album
  public user: User
  public artist: Artist
  public track: Track

  constructor (apiKey: string) {
    this.apiKey = apiKey

    this.album = new Album(this.apiKey)
    this.user = new User(this.apiKey)
    this.artist = new Artist(this.apiKey)
    this.track = new Track(this.apiKey)
  }

  async checkIfUserExists (username: string): Promise<{
    success: true
    exists: boolean
  } | ApiErrors> {
    const userInfo = await this.user.getInfo(username)
    if (!userInfo.success) {
      if (userInfo.errorType !== 'lfmApiError') {
        advError(`Error while checking if user exists in Last.fm! (errorType !== 'lfmApiError') Username: ${username} - Error: ${JSON.stringify(userInfo)}`)
        return userInfo
      }
      if (userInfo.errorData.error !== 6) {
        advError(`Error while checking if user exists in Last.fm! (errorData.error !== 6) Username: ${username} - Error: ${JSON.stringify(userInfo)}`)
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
      advError(`Error getting user page for ${username} - Error: ${userPageResponse.message}`)
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
      advError(`Error getting user page for ${username}, status code not 200 - Error: ${String(userPageResponse)}`)
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
      advError(`Error getting user page for ${username}, error getting text - Error: ${userPage.message}`)
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
