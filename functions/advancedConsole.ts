import { messageQueue } from '../MelodyScoutLog_Bot/bot'

export function advLog (log: any): void {
  console.log(log)
  messageQueue.push('🔵 - ' + String(log))
}

export function advInfo (info: any): void {
  console.info(info)
  messageQueue.push('🟠 - ' + String(info))
}

export function advError (error: any): void {
  console.error(error)
  messageQueue.push('🔴 - ' + String(error))
}
