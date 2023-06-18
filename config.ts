import dotenv from 'dotenv'
dotenv.config()

export const melodyScoutConfig = {
  divider: '️️',
  admins: process.env.ADMINS !== undefined ? process.env.ADMINS.split(',') : [],
  logoImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/newlogo.jpg',
  userImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/user.jpg',
  trackImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/track.jpg',
  popularityImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/popularity.jpg',
  aboutMelodyScoutAi: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/aboutMelodyScoutAi.jpg',
  urltoolong: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/urltoolong.jpg',
  msAndRaveDj: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/ms-rdj.jpg'
}

export const lastfmConfig = {
  apiKey: process.env.LASTFM_API_KEY !== undefined ? process.env.LASTFM_API_KEY : ''
}

export const geniusConfig = {
  accessToken: process.env.GENIUS_ACCESS_TOKEN !== undefined ? process.env.GENIUS_ACCESS_TOKEN : ''
}

export const spotifyConfig = {
  clientID: process.env.SPOTIFY_CLIENT_ID !== undefined ? process.env.SPOTIFY_CLIENT_ID : '',
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET !== undefined ? process.env.SPOTIFY_CLIENT_SECRET : ''
}

export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY !== undefined ? process.env.OPENAI_API_KEY : ''
}

export const serverConfig = {
  port: process.env.PORT !== undefined ? Number(process.env.PORT) : 3000,
  host: process.env.HOST !== undefined ? process.env.HOST : '0.0.0.0'
}
