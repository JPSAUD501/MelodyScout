import dotenv from 'dotenv'
dotenv.config()

export default {
  lastfm: {
    apiKey: process.env.LASTFM_API_KEY !== undefined ? process.env.LASTFM_API_KEY : ''
  },
  genius: {
    accessToken: process.env.GENIUS_ACCESS_TOKEN !== undefined ? process.env.GENIUS_ACCESS_TOKEN : ''
  }
}
