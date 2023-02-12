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
import { AllusersCommand } from './commands/allusers'

export class BotFunctions {
  startCommand: StartCommand
  helpCommand: HelpCommand
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
  allusersCommand: AllusersCommand

  trackpreviewCallback: TrackpreviewCallback
  playingnowCallback: PlayingnowCallback
  tracklyricsCallback: TracklyricsCallback
  translatedtracklyricsCallback: TranslatedtracklyricsCallback

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB, msGeniusApi: MsGeniusApi, msMusicApi: MsMusicApi) {
    this.startCommand = new StartCommand(ctxFunctions)
    this.helpCommand = new HelpCommand(ctxFunctions)
    this.contactCommand = new ContactCommand(ctxFunctions)
    this.myuserCommand = new MyuserCommand(advConsole, ctxFunctions, msLastfmApi, prismaDB)
    this.forgetmeCommand = new ForgetmeCommand(ctxFunctions, prismaDB)
    this.briefCommand = new BriefCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.playingnowCommand = new PlayingnowCommand(ctxFunctions, msLastfmApi, prismaDB, msMusicApi)
    this.historyCommand = new HistoryCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.pinCommand = new PinCommand(ctxFunctions)
    this.pntrackCommand = new PntrackCommand(ctxFunctions, msLastfmApi, prismaDB, msMusicApi)
    this.pnalbumCommand = new PnalbumCommand(ctxFunctions, msLastfmApi, msMusicApi, prismaDB)
    this.pnartistCommand = new PnartistCommand(ctxFunctions, msLastfmApi, msMusicApi, prismaDB)
    this.allusersCommand = new AllusersCommand(ctxFunctions, prismaDB)

    this.trackpreviewCallback = new TrackpreviewCallback(ctxFunctions, msMusicApi)
    this.playingnowCallback = new PlayingnowCallback(ctxFunctions, msLastfmApi, prismaDB, msMusicApi)
    this.tracklyricsCallback = new TracklyricsCallback(ctxFunctions, msGeniusApi)
    this.translatedtracklyricsCallback = new TranslatedtracklyricsCallback(ctxFunctions, msGeniusApi)

    advConsole.log('BotFunctions started!')
  }
}
