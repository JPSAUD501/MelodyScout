import { CallbackQueryContext, CommandContext, Context, InlineKeyboard } from 'grammy'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { getCallbackKey } from '../../../function/callbackMaker'
import { getPntrackText } from '../../textFabric/pntrack'
import { ctxReply } from '../../../function/grammyFunctions'
import { lastfmConfig } from '../../../config'
import { lang } from '../../../translations/base'

export async function runPntrackCommand (msMusicApi: MsMusicApi, msPrismaDbApi: MsPrismaDbApi, ctx: CommandContext<Context> | CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, lang(ctxLang, 'dontWorkOnChannelsInformMessage'))
    return
  }
  const telegramUserId = ctx.from?.id
  if (telegramUserId === undefined) {
    await ctxReply(ctx, lang(ctxLang, 'unableToGetUserIdErrorMessage'))
    return
  }
  const checkIfExistsTgUserDBResponse = await msPrismaDbApi.checkIfExists.telegramUser(`${telegramUserId}`)
  if (!checkIfExistsTgUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  if (!checkIfExistsTgUserDBResponse.exists) {
    void ctxReply(ctx, 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    return
  }
  const telegramUserDBResponse = await msPrismaDbApi.get.telegramUser(`${telegramUserId}`)
  if (!telegramUserDBResponse.success) {
    void ctxReply(ctx, lang(ctxLang, 'unableToGetUserInfoInDb'))
    return
  }
  const lastfmUser = telegramUserDBResponse.lastfmUser
  if (lastfmUser === null) {
    void ctxReply(ctx, 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>')
    return
  }
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userRecentTracksRequest = msLastfmApi.user.getRecentTracks(lastfmUser, 1)
  const [userInfo, userRecentTracks] = await Promise.all([userInfoRequest, userRecentTracksRequest])
  if (!userInfo.success) {
    void ctxReply(ctx, `Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>${lastfmUser}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.`)
    return
  }
  if (!userRecentTracks.success) {
    void ctxReply(ctx, 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (userRecentTracks.data.recenttracks.track.length <= 0) {
    void ctxReply(ctx, 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const mainTrack = {
    trackName: userRecentTracks.data.recenttracks.track[0].name,
    trackMbid: userRecentTracks.data.recenttracks.track[0].mbid,
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true'
  }
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const trackInfoRequest = msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest])
  if (!artistInfo.success) {
    void ctxReply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (!albumInfo.success) {
    void ctxReply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (!trackInfo.success) {
    void ctxReply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  if (!spotifyTrackInfo.success) {
    void ctxReply(ctx, 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.')
    return
  }
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url('[🎧] - Spotify', spotifyTrackInfo.data.externalURL.spotify)
  if (youtubeTrackInfo.success) inlineKeyboard.url('[🎥] - YouTube', youtubeTrackInfo.videoUrl)
  inlineKeyboard.row()
  inlineKeyboard.text('[🧾] - Letra', getCallbackKey(['TL', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text('[✨] - Explicação', getCallbackKey(['TLE', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.row()
  inlineKeyboard.text('[📥] - Preview', getCallbackKey(['TP', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text('[📥] - Download', getCallbackKey(['TD', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  await ctxReply(ctx, getPntrackText(userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo.data, mainTrack.nowPlaying), { reply_markup: inlineKeyboard })
}
