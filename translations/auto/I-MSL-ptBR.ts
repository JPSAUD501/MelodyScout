export type BaseLangInterface =
  { key: 'dontWorkOnChannelsInformMessage', value: 'Infelizmente eu ainda não funciono em canais! Acompanhe minhas atualizações para saber quando novas funções estarão disponíveis!' } |
  { key: 'lastfmUserNoMoreRegisteredError', value: 'Parece que você me pediu para esquecer seu usuário do Last.fm e não me informou um novo usuário, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' } |
  { key: 'lastfmUserNotRegistered', value: 'Parece que você ainda não possui um usuário do Last.fm registrado, para registrar um usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' } |
  { key: 'loadingInformCallback', value: '⏳ - Carregando…' } |
  { key: 'maintenanceInformCallback', value: '🛠 - O bot está em manutenção!' } |
  { key: 'maintenanceInformMessage', value: 'Não sei como me desculpar por isso, mas Infelizmente eu estou em manutenção! Sei que isso é muito chato, mas estou tentando resolver esse problema o mais rápido possível! Em breve estarei de volta! Aproveitando a oportunidade em nome do meu desenvolvedor eu gostaria de agradecer a todos os meus usuários! 💜\n\nSe você tiver alguma sugestão ou crítica, por favor entre em contato através do comando /contact! Eu ficarei muito feliz em ouvir o que você tem a dizer!' } |
  { key: 'noRecentTracksError', value: 'Parece que você nunca ouviu nada no Last.fm, que tal começar a ouvir algo agora? Se isso não for verdade entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'unableToGetUserInfoInDb', value: 'Não foi possível resgatar suas informações no banco de dados, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'unableToGetUserRecentTracksHistory', value: 'Estranho, não foi possível resgatar o histórico do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'lastfmUserDataNotFoundedError', value: 'Não foi possível resgatar suas informações do Last.fm, caso o seu usuário não seja mais <code>{{lastfmUser}}</code> utilize o comando /forgetme e em seguida o /myuser para registrar seu novo perfil! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'lastfmArtistDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'lastfmAlbumDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'lastfmTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações da música que você está ouvindo no Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'spotifyTrackDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do Spotify da música que você está ouvindo! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'spotifyButton', value: '[🎧] - Spotify' } |
  { key: 'youtubeButton', value: '[🎥] - YouTube' } |
  { key: 'lyricsButton', value: '[🧾] - Letra' } |
  { key: 'iaExplanationButton', value: '[✨] - Explicação' } |
  { key: 'trackPreviewButton', value: '[📥] - Visualizar' } |
  { key: 'trackDownloadButton', value: '[📥] - Baixar' } |
  { key: 'unableToGetMessageIdFromButtonInformMessage', value: 'Algo deu errado ao buscar a mensagem que você clicou, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' } |
  { key: 'errorOnSendLoadingMessageInformMessage', value: 'Algo deu errado ao enviar a mensagem de carregamento, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' } |
  { key: 'errorOnDownloadTrackInformMessage', value: 'Algo deu errado ao baixar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' } |
  { key: 'trackAudioDownloadCaption', value: '<b>[🎵] Download do áudio de "{{track}}" por "{{artist}}"</b>\n\nSolicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' } |
  { key: 'trackDownloadAudioButton', value: '[📥] - Áudio' } |
  { key: 'trackDownloadVideoButton', value: '[📥] - Vídeo' } |
  { key: 'chooseTrackDownloadOptionMessage', value: '<b>[📥] Download de "{{track}}" por "{{artist}}"</b>\n- Por favor escolha uma opção abaixo.\n\nSolicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' } |
  { key: 'trackLyricsTranslateButton', value: '[💬] - Traduzir' } |
  { key: 'creatingLyricsExplanationWithAiInformMessage', value: '⏳ - Gerando explicação da música com inteligência artificial, aguarde um momento…' } |
  { key: 'errorOnCreatingLyricsExplanationInformMessage', value: 'Ocorreu um erro ao tentar gerar a explicação da letra dessa música, por favor tente novamente mais tarde.' } |
  { key: 'trackLyricsExplanationTTSHeader', value: 'Explicação da música "{{track}}" de "{{artist}}" pelo MelodyScout.' } |
  { key: 'errorOnCreatingLyricsExplanationTTSInformMessage', value: 'Ocorreu um erro ao tentar gerar o áudio da explicação da letra dessa música, por favor tente novamente mais tarde.' } |
  { key: 'lastfmTrackOrArtistDataNotFoundedErrorCallback', value: '⚠ - Nome da música ou do artista não encontrado!' } |
  { key: 'sendingTrackPreviewInformCallback', value: '🎵 - Enviando preview da música' } |
  { key: 'trackPreviewCaptionMessage', value: '<b>[🎵] Pré-visualização de "{{track}}" por "{{artist}}"</b>\n\nSolicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' } |
  { key: 'spotifyTrackPreviewUrlNotFoundedErrorCallback', value: '⚠ - Ocorreu um erro ao tentar obter a URL de pré-visualização da música' } |
  { key: 'youtubeTrackDataNotFoundedErrorMessage', value: 'Algo deu errado ao buscar a música, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' } |
  { key: 'downloadingTrackInformMessage', value: '⏳ - Fazendo download da música…' } |
  { key: 'trackOrArtistNameNotFoundedInCallbackDataErrorMessage', value: 'Algo deu errado ao identificar a música ou o artista, por favor tente novamente mais tarde ou entre em contato através do comando /contact.' } |
  { key: 'trackVideoDownloadCaption', value: '<b>[🎬] Download do vídeo de "{{track}}" por "{{artist}}"</b>\n\nSolicitado por: <b><a href=\'tg://user?id={{requesterId}}\'>{{requesterName}}</a></b>' } |
  { key: 'unableToTranslateLyricsErrorMessage', value: 'Não foi possível traduzir a letra dessa música, tente novamente mais tarde! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'messageLengthGreater4096ErrorMessage', value: 'Ocorreu um erro ao tentar responder ao seu comando pois por algum motivo a mensagem ficou maior que 4096 caracteres. Nossa equipe já foi notificada e está trabalhando para resolver o problema o mais rápido possível. Desculpe pelo transtorno. Por favor, tente novamente!' } |
  { key: 'cantPinMessageErrorMessage', value: '[⚠] Não foi possível fixar a mensagem automaticamente. Caso queira você ainda pode fixa-la manualmente. Para isso, clique na mensagem acima e em seguida em "Fixar".\n\nEssa mensagem de aviso será apagada em 15 segundos.' } |
  { key: 'messageLengthGreater1024ErrorMessage', value: 'Ocorreu um erro ao enviar a resposta pois o tamanho da mensagem ficou maior que 1024 caracteres! Nossa equipe já foi notificada e irá corrigir o problema o mais rápido possível! Por favor tente novamente mais tarde!' } |
  { key: 'sendingAudioMessage', value: '<b>[🎵] Enviando áudio por favor aguarde!</b>' } |
  { key: 'sendingVoiceMessage', value: '<b>[🎤] Enviando áudio por favor aguarde!</b>' } |
  { key: 'sendingDocumentMessage', value: '<b>[📁] Enviando arquivo por favor aguarde!</b>' } |
  { key: 'sendingPhotoMessage', value: '<b>[📷] Enviando foto por favor aguarde!</b>' } |
  { key: 'unableToGetUserIdErrorMessage', value: 'Infelizmente não foi possível identificar seu id, por favor tente novamente mais tarde!' } |
  { key: 'unableToGetAllUsersFromDatabaseErrorMessage', value: 'Infelizmente não foi possível recuperar os usuários do banco de dados, por favor tente novamente mais tarde!' } |
  { key: 'sendingVideoMessage', value: '<b>[🎥] Enviando vídeo por favor aguarde!</b>' } |
  { key: 'allUsersListHeaderMessage', value: '<b>[🗃] Lista de usuários:</b>\n- Total de usuários: <code>{{userCount}}</code>' } |
  { key: 'allUsersListUserMessagePart', value: '<b>[{{userEmoji}}]<code> {{userLastfmName}}</code>:</b>\n- TelegramID: <code>{{userTelegramId}}</code>\n- LastUpdate: <code>{{userLastUpdate}}</code>' } |
  { key: 'firstTimeRegisterWelcomeMessage', value: 'Verifiquei que é seu primeiro cadastro no MelodyScout! Que bom que você decidiu me conhecer!' } |
  { key: 'getTopAlbumsErrorMessage', value: 'Estranho, não foi possível resgatar os seus álbuns mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'getTopArtistsErrorMessage', value: 'Estranho, não foi possível resgatar os seus artistas mais tocados do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'getTopTracksErrorMessage', value: 'Estranho, não foi possível resgatar as suas músicas mais tocadas do seu perfil do Last.fm! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'unableToGetLastfmUserInDbErrorMessage', value: 'Ops! Parece que eu não consegui recuperar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' } |
  { key: 'lastfmUserAlreadyNotRegisteredErrorMessage', value: 'Você já não tem seu usuário do Last.fm registrado, para registrar o seu usuário do Last.fm envie o comando /myuser e seu usuário do lastfm, por exemplo: <code>/myuser MelodyScout</code>' } |
  { key: 'unableToForgetLastfmUserInDbErrorMessage', value: 'Ops! Parece que eu não consegui esquecer o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' } |
  { key: 'lastfmUserForgetmeCheckingDataMessage', value: 'Ok! Deixa eu verificar alguns dados…' } |
  { key: 'noMaintenanceModeArgumentErrorMessage', value: 'Por favor, especifique se deseja ativar ou desativar o modo manutenção! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>' } |
  { key: 'maintenanceModeActivatedInformMessage', value: 'Modo de manutenção ativado!' } |
  { key: 'maintenanceModeDeactivatedInformMessage', value: 'Modo de manutenção desativado!' } |
  { key: 'invalidMaintenanceModeArgumentErrorMessage', value: 'Utilize apenas <code>on</code> ou <code>off</code> como argumento! Exemplo: <code>/maintenance on</code> ou <code>/maintenance off</code>' } |
  { key: 'mashupNeedTwoTracksError', value: 'Você precisa ter pelo menos duas músicas no seu histórico para que eu possa fazer um mashup! Tente novamente mais tarde.' } |
  { key: 'spotifyAlbumDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do álbum que você está ouvindo no Spotify! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'spotifyArtistDataNotFoundedError', value: 'Não entendi o que aconteceu, não foi possível resgatar as informações do artista que você está ouvindo no Spotify! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'audioButton', value: '[🎧] - Áudio' } |
  { key: 'videoButton', value: '[🎬] - Vídeo' } |
  { key: 'errorSendingMessage', value: 'Parece que algo deu errado ao enviar a mensagem, por favor tente novamente!' } |
  { key: 'whatAreYouListeningNowPinMessage', value: 'O que vc está ouvindo agr?' } |
  { key: 'playingNowButton', value: 'Tocando Agora' } |
  { key: 'mashupUnableToGetFirstTrackInfoErrorMessage', value: 'Não foi possível resgatar as informações da primeira música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'mashupUnableToGetSecondTrackInfoErrorMessage', value: 'Não foi possível resgatar as informações da segunda música do mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'mashupCreatingDataInformMessage', value: 'Eba! Vamos lá! Estou criando um mashup com as 2 últimas músicas que você ouviu!\n\n- <b><a href="{{firstTrackUrl}}">{{firstTrackName}} de {{firstTrackArtist}}</a></b>\n- <b><a href="{{secondTrackUrl}}">{{secondTrackName}} de {{secondTrackArtist}}</a></b>' } |
  { key: 'unableToCreateMashupErrorMessage', value: 'Não foi possível criar o mashup! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'unableToGetMashupStartCreationConfirmationErrorMessage', value: 'Não foi possível garantir que o mashup foi enviado para criação! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'mashupStartCreationInformMessage', value: 'Beleza! Seu mashup já foi enviado para criação! Essa etapa costuma demorar bastante mas não se preocupe, estou monitorando o processo e te aviso assim que ele estiver pronto! 😊' } |
  { key: 'mashupCreationTimeoutErrorMessage', value: 'Infelizmente não foi possível criar o mashup ou ele demorou demais para ser criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'unableToGetFinalMashupInfoErrorMessage', value: 'Não foi possível resgatar as informações do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'mashupCreatedInformMessage', value: 'Mashup criado com sucesso! 🎉\nEstou enviando ele para você, por favor aguarde enquanto o Telegram faz o upload do vídeo…' } |
  { key: 'unableToGetFinalMashupUrlErrorMessage', value: 'Não foi possível resgatar a URL do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'unableToGetFinalMashupThumbnailErrorMessage', value: 'Não foi possível resgatar a thumbnail do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'unableToGetFinalMashupVideoErrorMessage', value: 'Não foi possível resgatar o vídeo do mashup criado! Se o problema persistir entre em contato com o meu desenvolvedor utilizando o comando /contact.' } |
  { key: 'myuserMissingLastfmUserErrorMessage', value: 'Ops! Parece que você não me informou o seu nome de usuário do Last.fm! Por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>' } |
  { key: 'myuserAlreadyRegisteredLastfmUserInformMessage', value: 'Vi aqui que você já tem um nome de usuário do Last.fm cadastrado! Ele é "<code>{{lastfmUser}}</code>"! Se você quiser atualizar ele, por favor, tente novamente informando o seu nome de usuário do Last.fm como no exemplo a seguir: <code>/myuser MelodyScout</code>' } |
  { key: 'myuserAlreadyRegisteredLastfmUserErrorMessage', value: 'Ops! Parece que você já tem o nome de usuário do Last.fm "<code>{{lastfmUser}}</code>" cadastrado! Se você quiser atualizar ele, por favor, tente novamente informando o seu novo nome de usuário do Last.fm!' } |
  { key: 'myuserAlreadyRegisteredLastfmUserChangingInformMessage', value: 'Verifiquei que você já tem um nome de usuário do Last.fm cadastrado! Vou atualizar ele para você!' } |
  { key: 'myuserLastfmUserCheckErrorMessage', value: 'Ops! Eu não consegui verificar se o seu nome de usuário do Last.fm existe! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' } |
  { key: 'myuserLastfmUserNotExistsInLastfmErrorMessage', value: 'Ops! Parece que o nome de usuário do Last.fm que você me informou não existe! Por favor, tente novamente informando um nome de usuário do Last.fm válido!' } |
  { key: 'myuserLastfmUserDatabaseUpdateErrorMessage', value: 'Ops! Eu não consegui registrar o seu nome de usuário do Last.fm! Por favor, tente novamente mais tarde ou entre em contato com o desenvolvedor do bot utilizando o comando /contact!' } |
  { key: 'myuserLastfmUserSuccessfullyRegisteredInformMessage', value: 'Pronto! Seu nome de usuário do Last.fm foi registrado com sucesso! Agradeço imensamente por isso e espero que você aproveite o bot!' } |
  { key: 'tfBriefPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' } |
  { key: 'tfBriefPostMetricsTittle', value: '[📊] Métricas' } |
  { key: 'localeLangCode', value: 'pt-BR' } |
  { key: 'tfBriefPostMetricsTracksListened', value: '- Músicas ouvidas: {{tracksListenedLength}}' } |
  { key: 'tfBriefPostMetricsTracksKnown', value: '- Músicas conhecidas: {{tracksKnownLength}}' } |
  { key: 'tfBriefPostMetricsArtistsKnown', value: '- Artistas conhecidos: {{artistsKnownLength}}' } |
  { key: 'tfBriefPostMetricsAlbumsKnown', value: '- Álbuns conhecidos: {{albumsKnownLength}}' } |
  { key: 'tfBriefPostInfosTittle', value: '[ℹ️] Informações' } |
  { key: 'tfBriefPostInfosRepeatedTracks', value: '- {{repeatedTracksPercentage}}% das músicas ouvidas são repetidas.' } |
  { key: 'tfBriefPostInfosAverageRepeatTracks', value: '- Em média repete {{averageRepeatTracks}}x cada música que conhece.' } |
  { key: 'tfBriefPostMostPlayedTracksTittle', value: '[🎵] Músicas mais ouvidas' } |
  { key: 'tfBriefPostMostPlayedTracksListItem', value: '- ({{trackPlaycount}}x) {{trackName}} de {{trackArtistName}}' } |
  { key: 'tfBriefPostMostPlayedAlbumsTittle', value: '[💿] Álbuns mais ouvidos' } |
  { key: 'tfBriefPostMostPlayedAlbumsListItem', value: '- ({{albumPlaycount}}x) {{albumName}} de {{albumArtistName}}' } |
  { key: 'tfBriefPostMostPlayedArtistsTittle', value: '[👨‍🎤] Artistas mais ouvidos' } |
  { key: 'tfBriefPostMostPlayedArtistsListItem', value: '- ({{artistPlaycount}}x) {{artistName}}' } |
  { key: 'tfBriefUserMusicSummaryTittle', value: '<b>Resumo musical de <a href="{{userUrl}}">{{username}}</a></b>' } |
  { key: 'tfBriefMetricsTittle', value: '<b>[📊] Métricas</b>' } |
  { key: 'tfBriefPostShareButton', value: '(<i><a href="{{postUrl}}">Postar 𝕏</a></i>)' } |
  { key: 'tfBriefMetricsTracksListened', value: '- Músicas ouvidas: <b>{{tracksListenedLength}}</b>' } |
  { key: 'tfBriefMetricsTracksKnown', value: '- Músicas conhecidas: <b>{{tracksKnownLength}}</b>' } |
  { key: 'tfBriefMetricsRepeatedTracks', value: '- Músicas repetidas: <b>{{repeatedTracksLength}}</b>' } |
  { key: 'tfBriefMetricsArtistsKnown', value: '- Artistas conhecidos: <b>{{artistsKnownLength}}</b>' } |
  { key: 'tfBriefMetricsAlbumsKnown', value: '- Álbuns conhecidos: <b>{{albumsKnownLength}}</b>' } |
  { key: 'tfBriefInfosTittle', value: '<b>[ℹ️] Informações</b>' } |
  { key: 'tfBriefInfosRepeatedTracks', value: '- Dentre as suas músicas ouvidas <b>{{repeatedTracksPercentage}}%</b> são repetidas e <b>{{newTracksPercentage}}%</b> são novas.' } |
  { key: 'tfBriefInfosAverageRepeatTracks', value: '- Em média você repete <b>{{averageRepeatTracks}}</b> vezes cada música que conhece.' } |
  { key: 'tfBriefMostPlayedTracksTittle', value: '<b>[🎵] Músicas mais tocadas</b>' } |
  { key: 'tfBriefMostPlayedTracksListItem', value: '- ({{trackPlaycount}}x) <a href="{{trackUrl}}"><b>{{trackName}}</b> de <b>{{trackArtistName}}</b></a>' } |
  { key: 'tfBriefMostPlayedAlbumsTittle', value: '<b>[💿] Álbuns mais tocados</b>' } |
  { key: 'tfBriefMostPlayedAlbumsListItem', value: '- ({{albumPlaycount}}x) <a href="{{albumUrl}}"><b>{{albumName}}</b> de <b>{{albumArtistName}}</b></a>' } |
  { key: 'tfBriefMostPlayedArtistsTittle', value: '<b>[👨‍🎤] Artistas mais tocados</b>' } |
  { key: 'tfBriefMostPlayedArtistsListItem', value: '- ({{artistPlaycount}}x) <a href="{{artistUrl}}"><b>{{artistName}}</b></a>' } |
  { key: 'tfContactInform', value: 'Para entrar em contato com o desenvolvedor do MelodyScout, envie uma mensagem para o @jpsaud!' } |
  { key: 'lyricsExplanationAiPrompt', value: 'Explicação resumida da letra da música:' } |
  { key: 'tfTracklyricsexplanationHeader', value: '<b>[✨] Explicação de "{{trackName}}" por "{{artistName}}" fornecida pelo MelodyScoutAi solicitada por {{requestedBy}}</b>' } |
  { key: 'tfTracklyricsexplanationInEmojis', value: 'Em emojis: {{lyricsEmojis}}' } |
  { key: 'tfForgetmeSuccessMessage', value: 'Pronto! Eu esqueci o seu nome de usuário do Last.fm!' } |
  { key: 'googleTTSVoiceCode', value: 'pt' } |
  { key: 'tiktokApiVoiceCode', value: 'br' } |
  { key: 'deezerButton', value: '[🎧] - Deezer' } |
  { key: 'tfPlayingnowPostUserAtMelodyScoutBot', value: '{{username}} no @MelodyScoutBot' } |
  { key: 'tfPlayingnowPostTrackName', value: '[🎧{{badge}}] {{trackName}}' } |
  { key: 'tfPlayingnowPostArtistName', value: '- Artista: {{artistName}}' } |
  { key: 'tfPlayingnowPostScrobblesTitle', value: '[📊] Scrobbles' } |
  { key: 'tfPlayingnowPostTrackScrobbles', value: '- Música: {{trackPlaycount}}' } |
  { key: 'tfPlayingnowPostArtistScrobbles', value: '- Artista: {{artistPlaycount}}' } |
  { key: 'tfPlayingnowPostTrackPlaytime', value: 'Já ouviu essa música por {{hours}} horas e {{minutes}} minutos.' } |
  { key: 'tfPlayingnowPostInfo', value: '[ℹ️] {{info}}' } |
  { key: 'tfPlayingnowPostInfoTitle', value: '[ℹ️] Informações' } |
  { key: 'tfPlayingnowHeaderNowPlaying', value: '<b><a href="{{userUrl}}">{{username}}</a> está ouvindo</b>' } |
  { key: 'tfPlayingnowHeaderLastTrack', value: '<b><a href="{{userUrl}}">{{username}}</a> estava ouvindo</b>' } |
  { key: 'tfPlayingnowTrackInfo', value: '<b>[🎧{{badge}}] <a href="{{trackUrl}}">{{trackName}}</a></b>' } |
  { key: 'tfPlayingnowAlbumName', value: '- Álbum: <b><a href="{{albumUrl}}">{{albumName}}</a></b>' } |
  { key: 'tfPlayingnowArtistName', value: '- Artista: <b><a href="{{artistUrl}}">{{artistName}}</a></b>' } |
  { key: 'tfPlayingnowScrobblesTitle', value: '<b>[📊] Scrobbles</b>' } |
  { key: 'tfPlayingnowTrackScrobbles', value: '- Música: <b>{{trackPlaycount}}</b>' } |
  { key: 'tfPlayingnowAlbumScrobbles', value: '- Álbum: <b>{{albumPlaycount}}</b>' } |
  { key: 'tfPlayingnowArtistScrobbles', value: '- Artista: <b>{{artistPlaycount}}</b>' } |
  { key: 'tfPlayingnowInfoTrackPlaytime', value: '- Você já ouviu essa música por <b>{{hours}} horas</b> e <b>{{minutes}} minutos</b>.' } |
  { key: 'tfPlayingnowInfoTrackPopularity', value: '- A <a href="{{popularityInfoUrl}}">popularidade</a> atual dessa música é: <b>[{{popularity}}][{{stars}}]</b>' } |
  { key: 'tfPlayingnowInfoTrackAlbumPercentage', value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse álbum.' } |
  { key: 'tfPlayingnowInfoTrackArtistPercentage', value: '- Essa música representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' } |
  { key: 'tfPlayingnowInfoAlbumArtistPercentage', value: '- Esse álbum representa <b>{{percentage}}%</b> de todas suas reproduções desse artista.' } |
  { key: 'tfPlayingnowInfoArtistUserPercentage', value: '- Esse artista representa <b>{{percentage}}%</b> de todas suas reproduções.' } |
  { key: 'tfPlayingnowInfoTitle', value: '<b>[ℹ️] Informações</b>' } |
  { key: 'tfPlayingnowShareTitle', value: '<b>[🔗] Compartilhe</b>' } |
  { key: 'tfPlayingnowShareLink', value: '- <a href="{{postUrl}}">Compartilhar no 𝕏!</a>' } |
  { key: 'composeImageTitle', value: '<b>{{trackName}}</b> por <b>{{artistName}}</b>' } |
  { key: 'youtubeMusicButton', value: '[🎶] - YT Music' } |
  { key: 'trackLyricsNotFoundedError', value: 'Infelizmente não foi possível encontrar a letra dessa música em nenhuma de nossas fontes.' }
