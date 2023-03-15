import config from '../config'

export function urlLimiter (url: string): string {
  return url.length >= 150 ? config.melodyScout.urltoolong : url
}
