import { type CommandContext, type Context } from 'grammy'
import { ctxReply, ctxTempReply } from '../../../functions/grammyFunctions'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lastfmConfig, melodyScoutConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { createCollage } from '../../../functions/collage'
import { getCollageText } from '../../textFabric/collage'
import type { AlbumInfo } from '../../../api/msLastfmApi/types/zodAlbumInfo'
import PromisePool from '@supercharge/promise-pool'
import type { TrackInfo } from '../../../api/msLastfmApi/types/zodTrackInfo'

export async function runCollageCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  const messageId = ctx.message?.message_id
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return
  }
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
  void ctxTempReply(ctx, lang(ctxLang, { key: 'creatingCollageInformMessage', value: '⏳ - Sua colagem estará pronta em alguns segundos…' }), 15000, {
    reply_parameters: (messageId !== undefined) ? { message_id: messageId, allow_sending_without_reply: true } : undefined,
    disable_notification: true
  })
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 'overall', 9, 1)
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
  const userTopTracksAllInfo: Array<{
    trackInfo: TrackInfo
    albumInfo: AlbumInfo
  }> = []
  const getTopTracksErrors: string[] = []
  await PromisePool
    .for(userTopTracks.data.toptracks.track)
    .withConcurrency(10)
    .useCorrespondingResults()
    .process(async (track) => {
      const trackInfoRequest = msLastfmApi.track.getInfo(track.artist.name, track.name, track.mbid, lastfmUser)
      const albumInfoRequest = msLastfmApi.album.getInfo(track.artist.name, track.name, track.mbid, lastfmUser)
      const [trackInfo, albumInfo] = await Promise.all([trackInfoRequest, albumInfoRequest])
      if (!trackInfo.success) {
        getTopTracksErrors.push(`Error while fetching track info! Artist: ${track.artist.name}, Track: ${track.name}, mbid: ${track.mbid}, username: ${lastfmUser} - Error: ${JSON.stringify(trackInfo.errorData)}`)
        return
      }
      if (!albumInfo.success) {
        getTopTracksErrors.push(`Error while fetching album info! Artist: ${track.artist.name}, Track: ${track.name}, mbid: ${track.mbid}, username: ${lastfmUser} - Error: ${JSON.stringify(albumInfo.errorData)}`)
        return
      }
      userTopTracksAllInfo.push({
        trackInfo: trackInfo.data,
        albumInfo: albumInfo.data
      })
    })
  const orderedUserTopTracksAllInfo = userTopTracksAllInfo.sort((a, b) => {
    return Number(b.trackInfo.track.userplaycount) - Number(a.trackInfo.track.userplaycount)
  })
  if (getTopTracksErrors.length > 0) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnGettingTopTracksAlbumsInformMessage', value: 'Ocorreu um erro ao tentar resgatar as informações dos álbuns das suas músicas mais ouvidas, por favor tente novamente mais tarde.' }))
    return
  }
  const collageImage = await createCollage(ctxLang, orderedUserTopTracksAllInfo.map((track) => {
    const albumImageUrl = track.albumInfo.album.image[track.albumInfo.album.image.length - 1]['#text']
    return {
      artistName: track.trackInfo.track.artist.name,
      trackName: track.trackInfo.track.name,
      playcount: Number(track.trackInfo.track.userplaycount),
      trackImageUrl: albumImageUrl !== '' ? albumImageUrl : melodyScoutConfig.trackImgUrl
    }
  }))
  if (!collageImage.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'errorOnCreatingCollageInformMessage', value: 'Ocorreu um erro ao tentar gerar a imagem da sua colagem de músicas mais ouvidas, por favor tente novamente mais tarde.' }))
    return
  }
  await ctxReply(ctx, undefined, getCollageText(ctxLang, userInfo.data, collageImage.result.imageUrl, orderedUserTopTracksAllInfo), {
    link_preview_options: {
      show_above_text: true
    }
  })
}
