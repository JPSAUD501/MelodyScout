import { InlineQueryResultBuilder } from 'grammy'
import { type InlineQueryResult } from 'grammy/types'
import { MsLastfmApi } from '../../../../api/msLastfmApi/base'
import { lastfmConfig, melodyScoutConfig } from '../../../../config'
import { lang } from '../../../../translations/base'
import { getBriefText } from '../../../textFabric/brief'

export async function briefInlineResult (ctxLang: string | undefined, lastfmUser: string): Promise<{
  success: boolean
  result: InlineQueryResult
}> {
  const resultId = 'BRIEF'
  const resultName = 'Your musical brief!'
  const msLastfmApi = new MsLastfmApi(lastfmConfig.apiKey)
  const userInfoRequest = msLastfmApi.user.getInfo(lastfmUser)
  const userTopTracksRequest = msLastfmApi.user.getTopTracks(lastfmUser, 'overall', 5, 1)
  const userTopAlbumsRequest = msLastfmApi.user.getTopAlbums(lastfmUser, 5)
  const userTopArtistsRequest = msLastfmApi.user.getTopArtists(lastfmUser, 5)
  const [userInfo, userTopTracks, userTopAlbums, userTopArtists] = await Promise.all([userInfoRequest, userTopTracksRequest, userTopAlbumsRequest, userTopArtistsRequest])
  if (!userInfo.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }, { lastfmUser }), { parse_mode: 'HTML' })
    }
  }
  if (!userTopTracks.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'getTopTracksErrorMessage', value: 'Estranho, não foi possível resgatar as suas músicas mais tocadas do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, { key: 'getTopTracksErrorMessage', value: 'Estranho, não foi possível resgatar as suas músicas mais tocadas do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    }
  }
  if (!userTopAlbums.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'getTopAlbumsErrorMessage', value: 'Estranho, não foi possível resgatar os seus álbuns mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, { key: 'getTopAlbumsErrorMessage', value: 'Estranho, não foi possível resgatar os seus álbuns mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    }
  }
  if (!userTopArtists.success) {
    return {
      success: false,
      result: InlineQueryResultBuilder
        .article(resultId, resultName, {
          description: lang(ctxLang, { key: 'getTopArtistsErrorMessage', value: 'Estranho, não foi possível resgatar os seus artistas mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }),
          thumbnail_url: melodyScoutConfig.userImgUrl
        })
        .text(lang(ctxLang, { key: 'getTopArtistsErrorMessage', value: 'Estranho, não foi possível resgatar os seus artistas mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' }), { parse_mode: 'HTML' })
    }
  }
  return {
    success: true,
    result: InlineQueryResultBuilder
      .article(resultId, resultName, {
        description: `${userInfo.data.user.name} - ${userInfo.data.user.realname}`,
        thumbnail_url: userInfo.data.user.image[userInfo.data.user.image.length - 1]['#text'] ?? melodyScoutConfig.userImgUrl
      })
      .text(getBriefText(ctxLang, userInfo.data, userTopTracks.data, userTopAlbums.data, userTopArtists.data, undefined), { parse_mode: 'HTML' })
  }
}
