import { MsLastfmApi } from '../../api/msLastfmApi/base'
import { AdvConsole } from '../../function/advancedConsole'
import { PrismaDB } from '../../function/prismaDB/base'
import { BriefCommand } from './commands/brief'
import { ContactCommand } from './commands/contact'
import { ForgetmeCommand } from './commands/forgetme'
import { HelpCommand } from './commands/help'
import { MyuserCommand } from './commands/myuser'
import { PlayingnowCommand } from './commands/playingnow'
import { StartCommand } from './commands/start'
import { TrackCommand } from './commands/track'
import { TracklistCommand } from './commands/tracklist'
import { UntrackCommand } from './commands/untrack'
import { CtxFunctions } from '../../function/ctxFunctions'
import { HistoryCommand } from './commands/history'
import { LyricsCommand } from './commands/lyrics'
import { MsGeniusApi } from '../../api/msGeniusApi/base'
import { MsSpotifyApi } from '../../api/msSpotifyApi/base'
import { TrackpreviewCallback } from './callbacks/trackpreview'

export class BotFunctions {
  startCommand: StartCommand
  helpCommand: HelpCommand
  trackCommand: TrackCommand
  untrackCommand: UntrackCommand
  tracklistCommand: TracklistCommand
  contactCommand: ContactCommand
  myuserCommand: MyuserCommand
  forgetmeCommand: ForgetmeCommand
  briefCommand: BriefCommand
  playingnowCommand: PlayingnowCommand
  historyCommand: HistoryCommand
  lyricsCommand: LyricsCommand

  trackpreviewCallback: TrackpreviewCallback

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB, msGeniusApi: MsGeniusApi, msSpotifyApi: MsSpotifyApi) {
    this.startCommand = new StartCommand(ctxFunctions)
    this.helpCommand = new HelpCommand(ctxFunctions)
    this.trackCommand = new TrackCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.untrackCommand = new UntrackCommand(ctxFunctions, prismaDB)
    this.tracklistCommand = new TracklistCommand(ctxFunctions, prismaDB)
    this.contactCommand = new ContactCommand(ctxFunctions)
    this.myuserCommand = new MyuserCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.forgetmeCommand = new ForgetmeCommand(ctxFunctions, prismaDB)
    this.briefCommand = new BriefCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.playingnowCommand = new PlayingnowCommand(ctxFunctions, msLastfmApi, prismaDB, msSpotifyApi)
    this.historyCommand = new HistoryCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.lyricsCommand = new LyricsCommand(ctxFunctions, msLastfmApi, prismaDB, msGeniusApi)

    this.trackpreviewCallback = new TrackpreviewCallback(ctxFunctions, msSpotifyApi)
  }
}