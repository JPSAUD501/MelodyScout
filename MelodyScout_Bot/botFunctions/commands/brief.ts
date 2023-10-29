import { type CommandContext, type Context } from 'grammy'
import { ctxEditMessage, ctxReply } from '../../../functions/grammyFunctions'
import { getBriefText } from '../../textFabric/brief'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { lastfmConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { getUserFilteredTopTracks } from '../../../functions/getUserFilteredTopTracks'
import { type TracksTotalPlaytime, getTracksTotalPlaytime } from '../../../functions/getTracksTotalPlaytime'

export async function runBriefCommand (msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context>): Promise<void> {
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
  const getUserTotalPlaytime = async (): Promise<TracksTotalPlaytime> => {
    const userAllTopTracks = await getUserFilteredTopTracks(lastfmUser, undefined, undefined)
    const userTotalPlaytime = await getTracksTotalPlaytime(userAllTopTracks.data)
    return userTotalPlaytime
  }
  const userTotalPlaytimeRequest = getUserTotalPlaytime()
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 5, 1)
  const userTopAlbumsRequest = msLastfmApi.user.getTopAlbums(lastfmUser, 5)
  const userTopArtistsRequest = msLastfmApi.user.getTopArtists(lastfmUser, 5)
  const [userInfo, userTopTracks, userTopAlbums, userTopArtists] = await Promise.all([userInfoRequest, userTopTracksRequest, userTopAlbumsRequest, userTopArtistsRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }))
    return
  }
  if (!userTopTracks.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'getTopTracksErrorMessage', value: 'Estranho, não foi possível resgatar as suas músicas mais tocadas do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!userTopAlbums.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'getTopAlbumsErrorMessage', value: 'Estranho, não foi possível resgatar os seus álbuns mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!userTopArtists.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'getTopArtistsErrorMessage', value: 'Estranho, não foi possível resgatar os seus artistas mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const defaultUserTotalPlaytime: TracksTotalPlaytime = {
    status: 'loading'
  }
  const response = await ctxReply(ctx, undefined, getBriefText(ctxLang, userInfo.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data, defaultUserTotalPlaytime))
  if (response === undefined) return
  const userTotalPlaytime = await userTotalPlaytimeRequest
  await ctxEditMessage(ctx, { chatId: response.chat.id, messageId: response.message_id }, getBriefText(ctxLang, userInfo.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data, userTotalPlaytime))
}
