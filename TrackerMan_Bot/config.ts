import dotenv from 'dotenv';
dotenv.config();

export default {
  telegram: {
      token: process.env.TMB_TELEGRAM_TOKEN || ''
  }
}