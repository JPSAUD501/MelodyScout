import { type UserFromGetMe } from 'grammy/types'

export type GetBotInfoResponse = {
  success: false
  error: string
} | {
  success: true
  botInfo: UserFromGetMe
}
