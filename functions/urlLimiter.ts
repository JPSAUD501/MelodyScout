import { melodyScoutConfig } from '../config'

export function urlLimiter (url: string): string {
  return url.length >= 140 ? melodyScoutConfig.urltoolong : url
}
