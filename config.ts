import dotenv from 'dotenv'
dotenv.config()

export default {
  melodyScout: {
    divider: '️️',
    admins: process.env.ADMINS !== undefined ? process.env.ADMINS.split(',') : [],
    logoImgUrl: 'https://github.com/JPSAUD501/MelodyScout/blob/master/public/logo.jpg?raw=true',
    userImgUrl: 'https://github.com/JPSAUD501/MelodyScout/blob/master/public/user.jpg?raw=true',
    trackImgUrl: 'https://github.com/JPSAUD501/MelodyScout/blob/master/public/track.jpg?raw=true',
    popularityImgUrl: 'https://github.com/JPSAUD501/MelodyScout/blob/master/public/popularity.jpg?raw=true'
  },
  lastfm: {
    apiKey: process.env.LASTFM_API_KEY !== undefined ? process.env.LASTFM_API_KEY : ''
  },
  genius: {
    accessToken: process.env.GENIUS_ACCESS_TOKEN !== undefined ? process.env.GENIUS_ACCESS_TOKEN : ''
  },
  spotify: {
    clientID: process.env.SPOTIFY_CLIENT_ID !== undefined ? process.env.SPOTIFY_CLIENT_ID : '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET !== undefined ? process.env.SPOTIFY_CLIENT_SECRET : ''
  }
}
