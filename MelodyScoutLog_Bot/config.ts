import dotenv from 'dotenv'
dotenv.config()

export default {
  telegram: {
    token: process.env.MSLB_TELEGRAM_TOKEN ?? '',
    botId: process.env.MSLB_TELEGRAM_BOT_ID ?? '',
    logChannel: process.env.MSLB_TELEGRAM_LOG_CHAT_ID ?? ''
  }
}
