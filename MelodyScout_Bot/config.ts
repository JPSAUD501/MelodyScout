import dotenv from 'dotenv'
dotenv.config()

export default {
  telegram: {
    token: process.env['MSB_TELEGRAM_TOKEN'] ?? '',
    botId: process.env['MSB_TELEGRAM_BOT_ID'] ?? ''
  }
}
