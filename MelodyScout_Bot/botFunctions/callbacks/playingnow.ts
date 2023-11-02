import { type CallbackQueryContext, type Context, InlineKeyboard } from 'grammy'
import { ctxAnswerCallbackQuery, ctxReply } from '../../../functions/grammyFunctions'
import { MsLastfmApi } from '../../../api/msLastfmApi/base'
import { type MsPrismaDbApi } from '../../../api/msPrismaDbApi/base'
import { getCallbackKey } from '../../../functions/callbackMaker'
import { getPlayingnowText } from '../../textFabric/playingnow'
import { lastfmConfig, spotifyConfig } from '../../../config'
import { lang } from '../../../translations/base'
import { MsDeezerApi } from '../../../api/msDeezerApi/base'
import { MsMusicApi } from '../../../api/msMusicApi/base'
import { type DeezerTrack } from '../../../api/msDeezerApi/types/zodSearchTrack'
import { getTrackPreview } from '../../../functions/getTrackPreview'

export async function runPlayingnowCallback (msPrismaDbApi: MsPrismaDbApi, ctx: CallbackQueryContext<Context>): Promise<void> {
  const ctxLang = ctx.from.language_code
  void ctxAnswerCallbackQuery(ctx, lang(ctxLang, { key: 'loadingInformCallback', value: '⏳ - Carregando…' }))
  const telegramUserId = ctx.from.id
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
  const dateNow = new Date().getTime() / 1000
  const mainTrack: {
    trackName: string
    trackMbid: string
    albumName: string
    albumMbid: string
    artistName: string
    artistMbid: string
    nowPlaying: boolean
    firstScrobble: {
      loadingStatus: 'loading' | 'loaded' | 'error'
      unix: number
    }
  } = {
    trackName: userRecentTracks.data.recenttracks.track[0].name,
    trackMbid: userRecentTracks.data.recenttracks.track[0].mbid,
    albumName: userRecentTracks.data.recenttracks.track[0].album['#text'],
    albumMbid: userRecentTracks.data.recenttracks.track[0].album.mbid,
    artistName: userRecentTracks.data.recenttracks.track[0].artist.name,
    artistMbid: userRecentTracks.data.recenttracks.track[0].artist.mbid,
    nowPlaying: userRecentTracks.data.recenttracks.track[0]['@attr']?.nowplaying === 'true',
    firstScrobble: {
      loadingStatus: 'loading',
      unix: dateNow
    }
  }
  const msMusicApi = new MsMusicApi(spotifyConfig.clientID, spotifyConfig.clientSecret)
  const artistInfoRequest = msLastfmApi.artist.getInfo(mainTrack.artistName, mainTrack.artistMbid, lastfmUser)
  const albumInfoRequest = msLastfmApi.album.getInfo(mainTrack.artistName, mainTrack.albumName, mainTrack.albumMbid, lastfmUser)
  const trackInfoRequest = msLastfmApi.track.getInfo(mainTrack.artistName, mainTrack.trackName, mainTrack.trackMbid, lastfmUser)
  const spotifyTrackInfoRequest = msMusicApi.getSpotifyTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const youtubeTrackInfoRequest = msMusicApi.getYoutubeTrackInfo(mainTrack.trackName, mainTrack.artistName)
  const deezerTrackInfoRequest = new MsDeezerApi().search.track(mainTrack.trackName, mainTrack.artistName, 1)
  const trackPreviewRequest = getTrackPreview(mainTrack.trackName, mainTrack.artistName, ctx)
  const [artistInfo, albumInfo, trackInfo, spotifyTrackInfo, youtubeTrackInfo, deezerTrackInfo, trackPreview] = await Promise.all([artistInfoRequest, albumInfoRequest, trackInfoRequest, spotifyTrackInfoRequest, youtubeTrackInfoRequest, deezerTrackInfoRequest, trackPreviewRequest])
  if (!artistInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmArtistDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!albumInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmAlbumDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!trackInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'lastfmTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  if (!spotifyTrackInfo.success) {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'spotifyTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }))
    return
  }
  const deezerTrack: DeezerTrack | undefined = deezerTrackInfo.success && deezerTrackInfo.data.data.length > 0 ? deezerTrackInfo.data.data[0] : undefined
  const trackPreviewUrl = trackPreview.success ? trackPreview.telegramPreviewUrl : undefined
  const inlineKeyboard = new InlineKeyboard()
  inlineKeyboard.url(lang(ctxLang, { key: 'spotifyButton', value: '[🎧] - Spotify' }), spotifyTrackInfo.data[0].external_urls.spotify)
  if (deezerTrack !== undefined) inlineKeyboard.url(lang(ctxLang, { key: 'deezerButton', value: '[🎧] - Deezer' }), deezerTrack.link)
  inlineKeyboard.row()
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeButton', value: '[🎥] - YouTube' }), youtubeTrackInfo.videoUrl)
  if (youtubeTrackInfo.success) inlineKeyboard.url(lang(ctxLang, { key: 'youtubeMusicButton', value: '[🎶] - YT Music' }), youtubeTrackInfo.videoMusicUrl)
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, { key: 'lyricsButton', value: '[🧾] - Letra' }), getCallbackKey(['TL', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text(lang(ctxLang, { key: 'iaExplanationButton', value: '[✨] - Explicação' }), getCallbackKey(['TLE', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.row()
  inlineKeyboard.text(lang(ctxLang, { key: 'trackPreviewButton', value: '[📥] - Visualizar' }), getCallbackKey(['TP', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  inlineKeyboard.text(lang(ctxLang, { key: 'trackDownloadButton', value: '[📥] - Baixar' }), getCallbackKey(['TD', mainTrack.trackName.replace(/  +/g, ' '), mainTrack.artistName.replace(/  +/g, ' ')]))
  await ctxReply(ctx, undefined, getPlayingnowText(ctxLang, userInfo.data, artistInfo.data, albumInfo.data, trackInfo.data, spotifyTrackInfo.data[0], deezerTrack, mainTrack.nowPlaying, trackPreviewUrl), { reply_markup: inlineKeyboard })
}
