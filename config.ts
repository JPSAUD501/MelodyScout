import dotenv from 'dotenv'
dotenv.config()

export default {
  melodyScout: {
    divider: '️️',
    admins: process.env.ADMINS !== undefined ? process.env.ADMINS.split(',') : [],
    logoImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/newlogo.jpg',
    userImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/user.jpg',
    trackImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/track.jpg',
    popularityImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/popularity.jpg',
    aboutMelodyScoutAi: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/aboutMelodyScoutAi.jpg',
    urltoolong: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/urltoolong.jpg'
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
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY !== undefined ? process.env.OPENAI_API_KEY : ''
  },
  serverConfig: {
    port: process.env.PORT !== undefined ? Number(process.env.PORT) : 3000,
    host: process.env.HOST !== undefined ? process.env.HOST : '0.0.0.0'
  }
}
