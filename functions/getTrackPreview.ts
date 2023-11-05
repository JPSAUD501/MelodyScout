import { type Context, InputFile } from 'grammy'
import { MsDeezerApi } from '../api/msDeezerApi/base'
import { MsMusicApi } from '../api/msMusicApi/base'
import { melodyScoutConfig, spotifyConfig } from '../config'
import { advError, advLog } from './advancedConsole'

export async function getTelegramPreviewUrl (ctx: Context, previewUrl: string, trackName: string, trackArtist: string): Promise<string> {
  const audioMessage = await ctx.api.sendAudio(melodyScoutConfig.filesChannelId, new InputFile({ url: previewUrl }, trackName), {
    disable_notification: true,
    title: trackName,
    performer: trackArtist
  }).catch((err) => {
    return new Error(err)
  })
  if (audioMessage instanceof Error) {
    advError(`GetTrackPreview - Error on sending cache track preview to Telegram: Track (${trackName} - ${trackArtist}) - Track preview url: ${previewUrl} - Error: ${audioMessage.message}`)
    return previewUrl
  }
  void setTimeout(() => {
    void ctx.api.deleteMessage(audioMessage.chat.id, audioMessage.message_id).catch((err) => {
      advError(`GetTrackPreview - Error on deleting cache track preview from Telegram: Track (${trackName} - ${trackArtist}) - Track preview url: ${previewUrl} - Error: ${err}`)
    })
  }, 10000)
  if (audioMessage.chat.type !== 'channel') {
    advError(`GetTrackPreview - Error on sending cache track preview to Telegram: Track (${trackName} - ${trackArtist}) - Track preview url: ${previewUrl} - Error: Audio message chat type is not channel`)
    return previewUrl
  }
  const channelUsername = audioMessage.chat.username
  if (channelUsername === undefined) {
    advError(`GetTrackPreview - Error on sending cache track preview to Telegram: Track (${trackName} - ${trackArtist}) - Track preview url: ${previewUrl} - Error: Audio message chat username is undefined`)
    return previewUrl
  }
  const audioMessageLink = `https://t.me/${channelUsername}/${audioMessage.message_id}`
  return audioMessageLink
}

export async function getTrackPreview (trackName: string, trackArtist: string, getTelegramPreview: Context | undefined): Promise<{
  success: true
  previewUrl: string
  telegramPreviewUrl: string
} | {
  success: false
  error: string
}> {
  const spotifyTrackInfoPromise = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret).getSpotifyTrackInfo(trackName, trackArtist)
  const deezerSearchTrackPromise = new MsDeezerApi().search.track(trackName, trackArtist, 1)
  const [spotifyTrackInfo, deezerSearchTrack] = await Promise.all([spotifyTrackInfoPromise, deezerSearchTrackPromise])
  const previewUrls: string[] = []
  if (spotifyTrackInfo.success) {
    if (spotifyTrackInfo.data.length >= 1) {
      if (spotifyTrackInfo.data[0].preview_url !== null) previewUrls.push(spotifyTrackInfo.data[0].preview_url)
    }
  }
  if (deezerSearchTrack.success) {
    if (deezerSearchTrack.data.data.length >= 1) {
      if (deezerSearchTrack.data.data[0].preview !== null) previewUrls.push(deezerSearchTrack.data.data[0].preview)
    }
  }
  if (previewUrls.length <= 0) {
    advError(`GetTrackPreview - No one preview url founded for track (${trackName} - ${trackArtist})`)
    return {
      success: false,
      error: 'Track preview url not founded'
    }
  }
  const mainPreviewUrl = previewUrls[0]
  let telegramPreviewUrl = mainPreviewUrl
  if (getTelegramPreview !== undefined) {
    telegramPreviewUrl = await getTelegramPreviewUrl(getTelegramPreview, mainPreviewUrl, trackName, trackArtist)
  }
  advLog(`GetTrackPreview - Preview url founded for track (${trackName} - ${trackArtist}):\n\n${previewUrls.map(url => `${url}`).join('\n')}`)
  return {
    success: true,
    previewUrl: mainPreviewUrl,
    telegramPreviewUrl
  }
}
