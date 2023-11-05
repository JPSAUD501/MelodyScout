import dotenv from 'dotenv'
import pathToFfmpeg from 'ffmpeg-static'
dotenv.config()

export const melodyScoutConfig = {
  divider: '️️',
  admins: process.env.ADMINS !== undefined ? process.env.ADMINS.split(',') : [],
  logoImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/logo.png',
  userImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/user.png',
  trackImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/track.png',
  albumImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/album.png',
  artificialIntelligenceImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/ai.gif',
  artificialIntelligenceImgErrorUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/aiError.png',
  popularityImgUrl: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/popularity.png',
  aboutMelodyScoutAi: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/ms-ai.png',
  urltoolong: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/urlLong.png',
  msAndRaveDj: 'https://raw.githubusercontent.com/JPSAUD501/MelodyScout/master/public/v2/ms-rdj.png',
  filesChannelId: Number(process.env.MSB_FC_TELEGRAM_CHAT_ID ?? '')
}

export const lastfmConfig = {
  apiKey: process.env.LASTFM_API_KEY ?? ''
}

export const geniusConfig = {
  accessToken: process.env.GENIUS_ACCESS_TOKEN ?? ''
}

export const spotifyConfig = {
  clientID: process.env.SPOTIFY_CLIENT_ID ?? '',
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? ''
}

export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY ?? ''
}

export const replicateConfig = {
  token: process.env.REPLICATE_TOKEN ?? ''
}

export const githubConfig = {
  token: process.env.GH_TOKEN ?? ''
}

export const serverConfig = {
  port: process.env.PORT ?? '9000',
  host: process.env.HOST ?? '0.0.0.0'
}

export const instagramConfig = {
  username: process.env.IG_USERNAME ?? '',
  password: process.env.IG_PASSWORD ?? ''
}

export const ffConfig = {
  ffmpegPath: pathToFfmpeg ?? ''
}

function checkConfig (): void {
  const allConfig = {
    melodyScoutConfig,
    lastfmConfig,
    geniusConfig,
    spotifyConfig,
    openaiConfig,
    replicateConfig,
    githubConfig,
    serverConfig,
    instagramConfig,
    ffConfig
  }
  for (const config in allConfig) {
    for (const key in allConfig[config]) {
      if (allConfig[config][key] === '' || allConfig[config][key] === undefined) {
        throw new Error(`Config ${config} key ${key} is empty!`)
      }
    }
  }
}
checkConfig()
