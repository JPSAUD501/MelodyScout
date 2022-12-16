import dotenv from 'dotenv';
dotenv.config();

export default {
  telegram: {
      token: process.env.TMLB_TELEGRAM_TOKEN || '',
      logChannel: '-1001627211303'
  }
}