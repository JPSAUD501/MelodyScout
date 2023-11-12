import { type CallbackQueryContext, type CommandContext, type Context, InlineKeyboard } from 'grammy'
import { ctxEditMessage, ctxReply } from '../../../functions/grammyFunctions'
import { getPnalbumText } from '../../textFabric/pnalbum'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { lastfmConfig, spotifyConfig } from '../../../config'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'

import { lang } from '../../../translations/base'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { type UserFilteredTopTracks, getUserFilteredTopTracks } from '../../../functions/getUserFilteredTopTracks'
import { getTracksTotalPlaytime, type TracksTotalPlaytime } from '../../../functions/getTracksTotalPlaytime'
import { type DeezerAlbum } from '../../../api/msDeezerApi/types/zodSearchAlbum'
import { type AlbumSimplified } from '@soundify/web-api'

export async function runPnalbumCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context> | CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
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
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1, 1)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }))
    return
  }
  if (!userRecentTracks.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserRecentTracksHistory', value: 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'noRecentTracksError', value: 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const mainTrack = {
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const spotifyAlbumInfoRequest = msMusicApi.getSpotifyAlbumInfo(mainTrack.artistName, mainTrack.albumName)
  const deezerAlbumInfoRequest = new MsDeezerApi().search.album(`${mainTrack.albumName} ${mainTrack.artistName}`, 1)
  const [artistInfo, albumInfo, spotifyAlbumInfo, deezerAlbumInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, spotifyAlbumInfoRequest, deezerAlbumInfoRequest])
  if (!artistInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmArtistDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!albumInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmAlbumDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  // if (!spotifyAlbumInfo.success) {
  //   void ctxReply(ctx, undefined, lang(ctxLang, { key: 'spotifyAlbumDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Spotify! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
  //   return
  // }
  const userAlbumTopTracksRequest = getUserFilteredTopTracks(lastfmUser, mainTrack.artistName, albumInfo.data.album)
  const defaultUserAlbumTopTracksRequest: UserFilteredTopTracks = {
    status: 'loading',
    data: []
  }
  const defaultUserAlbumTotalPlaytime: TracksTotalPlaytime = {
    status: 'loading'
  }
  const spotifyAlbum: AlbumSimplified | undefined = spotifyAlbumInfo.success && spotifyAlbumInfo.data.length > 0 ? spotifyAlbumInfo.data[0] : undefined
  const deezerAlbum: DeezerAlbum | undefined = deezerAlbumInfo.success && deezerAlbumInfo.data.data.length > 0 ? deezerAlbumInfo.data.data[0] : undefined
  const inlineKeyboard = new InlineKeyboard()
  if (spotifyAlbum !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'spotifyButton', value: '[🎧] - Spotify' }), spotifyAlbum.external_urls.spotify)
  if (deezerAlbum !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'deezerButton', value: '[🎧] - Deezer' }), deezerAlbum.link)
  const response = await ctxReply(ctx, undefined, getPnalbumText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, defaultUserAlbumTopTracksRequest, defaultUserAlbumTotalPlaytime, spotifyAlbum, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  if (response === undefined) return
  const userAlbumTopTracks = await userAlbumTopTracksRequest
  const userAlbumTotalPlaytimeRequest = getTracksTotalPlaytime(userAlbumTopTracks.data)
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getPnalbumText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, userAlbumTopTracks, defaultUserAlbumTotalPlaytime, spotifyAlbum, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
  const userAlbumTotalPlaytime = await userAlbumTotalPlaytimeRequest
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getPnalbumText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, userAlbumTopTracks, userAlbumTotalPlaytime, spotifyAlbum, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
}
