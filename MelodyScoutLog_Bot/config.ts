import dotenv from 'dotenv';
dotenv.config();

export default {
  telegram: {
      token: process.env.MSLB_TELEGRAM_TOKEN || '',
      logChannel: '-1001828315379'
  }
}