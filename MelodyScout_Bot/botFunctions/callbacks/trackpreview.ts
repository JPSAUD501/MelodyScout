import { CallbackQueryContext, Context, InputFile } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply, ctxReplyWithAudio } from '../../../function/grammyFunctions'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getTrackpreviewText } from '../../textFabric/trackpreview'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'

export async function runTrackpreviewCallback (msMusicApi: MsMusicApi, ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'dontWorkOnChannelsInformCallback'))
    return
  }
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const track = dataArray[1]
  const artist = dataArray[2]
  if (track === undefined || artist === undefined) return await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'lastfmTrackOrArtistDataNotFoundedErrorCallback'))
  const spotifyTrackInfoPromise = msMusicApi.getSpotifyTrackInfo(track, artist)
  const deezerSearchTrackPromise = new MsDeezerApi().search.track(track, artist, 1)
  const [spotifyTrackInfo, deezerSearchTrack] = await Promise.all([spotifyTrackInfoPromise, deezerSearchTrackPromise])
  const previewUrls: string[] = []
  if (spotifyTrackInfo.success) {
    if (spotifyTrackInfo.data[0].previewURL !== null) previewUrls.push(spotifyTrackInfo.data[0].previewURL)
  }
  if (deezerSearchTrack.success) {
    if (deezerSearchTrack.data.data[0].preview !== null) previewUrls.push(deezerSearchTrack.data.data[0].preview)
  }
  if (previewUrls.length <= 0) {
    return await ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'spotifyTrackPreviewUrlNotFoundedErrorCallback'))
  }
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, 'sendingTrackPreviewInformCallback'))
  await ctxReplyWithAudio(ctx, new InputFile({ url: previewUrls[0] }), {
    title: track,
    performer: artist,
    caption: getTrackpreviewText(ctxLang, track, artist, ctx.from.id.toString(), ctx.from.first_name),
    reply_to_message_id: messageId,
    allow_sending_without_reply: true
  })
}
