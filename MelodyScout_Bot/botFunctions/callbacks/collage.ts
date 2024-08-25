import { ctxAnswerCallbackQuery, ctxReply, ctxTempReply } from '../../../functions/grammyFunctions'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lastfmConfig, melodyScoutConfig, spotifyConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { createCollage, type CollageTrackData } from '../../../functions/collage'
import { getCollageText } from '../../textFabric/collage'
import PromisePool from '@supercharge/promise-pool'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { downloadImage } from '../../../functions/downloadImage'
import { InlineKeyboard, type CallbackQueryContext, type Context } from 'grammy'
import { getCallbackKey } from '../../../functions/callbackMaker'

export async function runCollageCallback (msPrismaDbApi: MsPrismaDbApi, ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'loadingInformCallback', value: '⏳ - Carregando…' }))
  const messageId = ctx.callbackQuery.message?.message_id
  const dataArray = ctx.callbackQuery.data.split(melodyScoutConfig.divider)
  const period = dataArray[1] as 'overall' | '7day' | '1month' | '3month' | '6month' | '12month'
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }))
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserNotRegistered', value: 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }))
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserNoMoreRegisteredError', value: 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' }))
    return
  }
  void ctxTempReply(ctx, lang(ctxLang, { key: 'creatingCollageInformMessage', value: '⏳ - Sua colagem estará pronta em alguns segundos…' }), 20000, {
    reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined,
    disable_notification: true
  })
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, period, 9, 1)
  const [userInfo, userTopTracks] = await Promise.all([userInfoRequest, userTopTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }))
    return
  }
  if (!userTopTracks.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserTopTracks', value: 'Não foi possível resgatar suas músicas mais ouvidas no Last.fm, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (userTopTracks.data.toptracks.track.length < 9) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'notEnoughTopTracksError', value: 'Ouça pelo menos 9 músicas no período de tempo selecionado para gerar a colagem!' }))
    return
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const userTopTracksAllInfo: CollageTrackData[] = []
  const getTopTracksErrors: string[] = []
  await PromisePool
    .for(userTopTracks.data.toptracks.track)
    .withConcurrency(5)
    .process(async (track) => {
      const trackInfoRequest = msLastfmApi.track.getInfo(track.artist.name, track.name, track.mbid, lastfmUser)
      const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(track.artist.name, track.name)
      const albumInfoRequest = msLastfmApi.album.getInfo(track.artist.name, track.name, track.mbid, lastfmUser)
      const [trackInfo, albumInfo, spotifyTrackInfo] = await Promise.all([trackInfoRequest, albumInfoRequest, spotifyTrackInfoRequest])
      if (!trackInfo.success) {
        getTopTracksErrors.push(`Error while fetching track info! Artist: ${track.artist.name}, Track: ${track.name}, mbid: ${track.mbid}, username: ${lastfmUser} - Error: ${JSON.stringify(trackInfo.errorData)}`)
        return
      }
      const imageUrls: string[] = []
      if (albumInfo.success) {
        imageUrls.push(albumInfo.data.album.image[albumInfo.data.album.image.length - 1]['#text'])
      }
      if (spotifyTrackInfo.success) {
        imageUrls.push(spotifyTrackInfo.data[0].album.images[0].url)
      }
      imageUrls.push(melodyScoutConfig.trackImgUrl)
      let trackImageBase64: string | undefined
      for (const imageUrl of imageUrls) {
        if (trackImageBase64 !== undefined) continue
        if (imageUrl.length <= 0) continue
        const image = await downloadImage(imageUrl)
        if (image.success) {
          trackImageBase64 = image.image.toString('base64')
          break
        }
      }
      if (trackImageBase64 === undefined) {
        getTopTracksErrors.push(`Error while downloading track image! Artist: ${track.artist.name}, Track: ${track.name}, mbid: ${track.mbid}, username: ${lastfmUser}`)
        return
      }
      userTopTracksAllInfo.push({
        trackInfo: trackInfo.data,
        trackName: track.name,
        artistName: track.artist.name,
        imageBase64: trackImageBase64,
        playcount: Number(trackInfo.data.track.userplaycount)
      })
    })
  const orderedUserTopTracksAllInfo = userTopTracksAllInfo.sort((a, b) => {
    return Number(b.trackInfo.track.userplaycount) - Number(a.trackInfo.track.userplaycount)
  })
  if (getTopTracksErrors.length > 0) {
    console.error(getTopTracksErrors)
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnGettingTopTracksAlbumsInformMessage', value: 'Ocorreu um erro ao tentar resgatar as informações dos álbuns das suas músicas mais ouvidas, por favor tente novamente mais tarde.' }))
    return
  }
  const collageImage = await createCollage(ctxLang, orderedUserTopTracksAllInfo)
  if (!collageImage.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnCreatingCollageInformMessage', value: 'Ocorreu um erro ao tentar gerar a imagem da sua colagem de músicas mais ouvidas, por favor tente novamente mais tarde.' }))
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.text(lang(ctxLang, { key: 'collageOverallButton', value: '[📆] - Desde sempre' }), getCallbackKey(['CLG', 'overall']))
  inlineKeyboard.text(lang(ctxLang, { key: 'collage7dayButton', value: '[📆] - Últimos 7d' }), getCallbackKey(['CLG', '7day']))
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, { key: 'collage1monthButton', value: '[📆] - Último mês' }), getCallbackKey(['CLG', '1month']))
  inlineKeyboard.text(lang(ctxLang, { key: 'collage3monthButton', value: '[📆] - Últimos 3m' }), getCallbackKey(['CLG', '3month']))
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, { key: 'collage6monthButton', value: '[📆] - Últimos 6m' }), getCallbackKey(['CLG', '6month']))
  inlineKeyboard.text(lang(ctxLang, { key: 'collage12monthButton', value: '[📆] - Último ano' }), getCallbackKey(['CLG', '12month']))
  await ctxReply(ctx, undefined, getCollageText(ctxLang, userInfo.data, collageImage.result.imageUrl, orderedUserTopTracksAllInfo, period), {
    link_preview_options: {
      show_above_text: true
    },
    reply_markup: inlineKeyboard
  })
}
