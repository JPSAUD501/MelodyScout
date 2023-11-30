import { InputFile, type CommandContext, type Context } from 'grammy'
import { ctxReply, ctxReplyWithAudio } from '../../../functions/grammyFunctions'
import { lang } from '../../../translations/base'
import axios from 'axios'
import { getTrackPreview } from '../../../functions/getTrackPreview'
import { getTrackpreviewText } from '../../textFabric/trackpreview'
import { MsAcrCloudApi } from '../../../api/msAcrCloudApi/base'
import { acrCloudConfig } from '../../../config'
import config from '../../config'

export async function runRecognizeCommand (ctx: CommandContext<Context>): Promise<void> {
  const ctxLang = ctx.from?.language_code
  if (ctx.chat?.type === 'channel') {
    void ctxReply(ctx, undefined, lang(ctxLang, { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' }))
    return
  }
  const ctxFrom = ctx.from
  if (ctxFrom === undefined) {
    await ctxReply(ctx, undefined, lang(ctxLang, { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' }))
    return
  }
  const messageId = ctx.message?.message_id
  if (messageId === undefined) {
    void ctxReply(ctx, undefined, 'Envie um áudio de até 30 segundos e responda ele com o comando /recognize ou simplesmente /r para que eu possa identificar a música!')
    return
  }
  const messageReplyToMessage = ctx.message?.reply_to_message
  if (messageReplyToMessage === undefined) {
    void ctxReply(ctx, undefined, 'Envie um áudio de até 30 segundos e responda ele com o comando /recognize ou simplesmente /r para que eu possa identificar a música!')
    return
  }
  const file = messageReplyToMessage.voice
  if (file === undefined) {
    await ctxReply(ctx, undefined, 'Envie um áudio de até 30 segundos e responda ele com o comando /recognize ou simplesmente /r para que eu possa identificar a música!')
    return
  }
  if (file.duration > 30) {
    await ctxReply(ctx, undefined, 'Infelizmente eu não consigo identificar áudios com mais de 30 segundos!')
    return
  }
  const telegramFile = await ctx.api.getFile(file.file_id)
  const audioFile = await axios.get(`https://api.telegram.org/file/bot${config.telegram.token}/${telegramFile.file_path}`, { responseType: 'arraybuffer' }).catch((err) => { return new Error(err) })
  if (audioFile instanceof Error) {
    await ctxReply(ctx, undefined, 'Não foi possível identificar o áudio, por favor tente novamente mais tarde!')
    return
  }
  if (!(audioFile.data instanceof Buffer)) {
    await ctxReply(ctx, undefined, 'Não foi possível identificar o áudio, por favor tente novamente mais tarde!')
    return
  }
  const identifyResponse = await new MsAcrCloudApi(acrCloudConfig.accessKey, acrCloudConfig.secretKey).identify.track(audioFile.data)
  if (!identifyResponse.success) {
    await ctxReply(ctx, undefined, 'Não foi possível identificar o áudio, por favor tente novamente mais tarde!')
    return
  }
  const track = identifyResponse.data.metadata.humming[0].title
  const artist = identifyResponse.data.metadata.humming[0].artists[0].name
  const trackPreview = await getTrackPreview(track, artist, undefined)
  if (!trackPreview.success) {
    await ctxReply(ctx, undefined, 'Não foi possível identificar o áudio, por favor tente novamente mais tarde!')
    return
  }
  await ctxReplyWithAudio(ctx, new InputFile({ url: trackPreview.previewUrl }, track), {
    title: track,
    performer: artist,
    caption: getTrackpreviewText(ctxLang, track, artist, ctxFrom.id.toString(), ctxFrom.first_name),
    reply_to_message_id: messageReplyToMessage.message_id,
    allow_sending_without_reply: true
  })
}
