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
import { MsGeniusApi } from '../../api/msGeniusApi/base'
import { MsMusicApi } from '../../api/msMusicApi/base'
import { TrackpreviewCallback } from './callbacks/trackpreview'
import { PinCommand } from './commands/pin'
import { PntrackCommand } from './commands/pntrack'
import { PnalbumCommand } from './commands/pnalbum'
import { PnartistCommand } from './commands/pnartist'
import { PlayingnowCallback } from './callbacks/playingnow'
import { TracklyricsCallback } from './callbacks/tracklyrics'
import { TranslatedtracklyricsCallback } from './callbacks/translatedtracklyrics'

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
  pinCommand: PinCommand
  pntrackCommand: PntrackCommand
  pnalbumCommand: PnalbumCommand
  pnartistCommand: PnartistCommand

  trackpreviewCallback: TrackpreviewCallback
  playingnowCallback: PlayingnowCallback
  tracklyricsCallback: TracklyricsCallback
  translatedtracklyricsCallback: TranslatedtracklyricsCallback

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB, msGeniusApi: MsGeniusApi, msMusicApi: MsMusicApi) {
    this.startCommand = new StartCommand(ctxFunctions)
    this.helpCommand = new HelpCommand(ctxFunctions)
    this.trackCommand = new TrackCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.untrackCommand = new UntrackCommand(ctxFunctions, prismaDB)
    this.tracklistCommand = new TracklistCommand(ctxFunctions, prismaDB)
    this.contactCommand = new ContactCommand(ctxFunctions)
    this.myuserCommand = new MyuserCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.forgetmeCommand = new ForgetmeCommand(ctxFunctions, prismaDB)
    this.briefCommand = new BriefCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.playingnowCommand = new PlayingnowCommand(ctxFunctions, msLastfmApi, prismaDB, msMusicApi)
    this.historyCommand = new HistoryCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.pinCommand = new PinCommand(ctxFunctions)
    this.pntrackCommand = new PntrackCommand(ctxFunctions, msLastfmApi, prismaDB, msMusicApi)
    this.pnalbumCommand = new PnalbumCommand(ctxFunctions, msLastfmApi, msMusicApi, prismaDB)
    this.pnartistCommand = new PnartistCommand(ctxFunctions, msLastfmApi, msMusicApi, prismaDB)

    this.trackpreviewCallback = new TrackpreviewCallback(ctxFunctions, msMusicApi)
    this.playingnowCallback = new PlayingnowCallback(ctxFunctions, msLastfmApi, prismaDB, msMusicApi)
    this.tracklyricsCallback = new TracklyricsCallback(ctxFunctions, msGeniusApi)
    this.translatedtracklyricsCallback = new TranslatedtracklyricsCallback(ctxFunctions, msGeniusApi)
  }
}
