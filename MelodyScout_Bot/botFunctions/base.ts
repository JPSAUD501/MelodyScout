import { MsLastfmApi } from '../../api/msLastfmApi/base'
import { AdvConsole } from '../../function/advancedConsole'
import { MsPrismaDbApi } from '../../api/msPrismaDbApi/base'
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
import { MaintenanceCommand } from './commands/maintenance'
import { MaintenanceinformCommand } from './commands/maintenanceinform'
import { MaintenanceinformCallback } from './callbacks/maintenanceinform'
import { TracklyricsexplanationCallback } from './callbacks/tracklyricsexplanation'
import { MsOpenAiApi } from '../../api/msOpenAiApi/base'

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
  maintenanceCommand: MaintenanceCommand
  maintenanceinformCommand: MaintenanceinformCommand

  trackpreviewCallback: TrackpreviewCallback
  playingnowCallback: PlayingnowCallback
  tracklyricsCallback: TracklyricsCallback
  translatedtracklyricsCallback: TranslatedtracklyricsCallback
  maintenanceinformCallback: MaintenanceinformCallback
  tracklyricsexplanationCallback: TracklyricsexplanationCallback

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi, msGeniusApi: MsGeniusApi, msMusicApi: MsMusicApi, msOpenAiApi: MsOpenAiApi) {
    this.startCommand = new StartCommand(ctxFunctions)
    this.helpCommand = new HelpCommand(ctxFunctions)
    this.contactCommand = new ContactCommand(ctxFunctions)
    this.myuserCommand = new MyuserCommand(advConsole, ctxFunctions, msLastfmApi, msPrismaDbApi)
    this.forgetmeCommand = new ForgetmeCommand(ctxFunctions, msPrismaDbApi)
    this.briefCommand = new BriefCommand(ctxFunctions, msLastfmApi, msPrismaDbApi)
    this.playingnowCommand = new PlayingnowCommand(ctxFunctions, msLastfmApi, msPrismaDbApi, msMusicApi)
    this.historyCommand = new HistoryCommand(ctxFunctions, msLastfmApi, msPrismaDbApi)
    this.pinCommand = new PinCommand(ctxFunctions)
    this.pntrackCommand = new PntrackCommand(ctxFunctions, msLastfmApi, msPrismaDbApi, msMusicApi)
    this.pnalbumCommand = new PnalbumCommand(ctxFunctions, msLastfmApi, msMusicApi, msPrismaDbApi)
    this.pnartistCommand = new PnartistCommand(ctxFunctions, msLastfmApi, msMusicApi, msPrismaDbApi)
    this.allusersCommand = new AllusersCommand(ctxFunctions, msPrismaDbApi)
    this.maintenanceCommand = new MaintenanceCommand(advConsole, ctxFunctions)
    this.maintenanceinformCommand = new MaintenanceinformCommand(advConsole, ctxFunctions)

    this.trackpreviewCallback = new TrackpreviewCallback(ctxFunctions, msMusicApi)
    this.playingnowCallback = new PlayingnowCallback(ctxFunctions, msLastfmApi, msPrismaDbApi, msMusicApi)
    this.tracklyricsCallback = new TracklyricsCallback(ctxFunctions, msGeniusApi)
    this.translatedtracklyricsCallback = new TranslatedtracklyricsCallback(ctxFunctions, msGeniusApi)
    this.maintenanceinformCallback = new MaintenanceinformCallback(advConsole, ctxFunctions)
    this.tracklyricsexplanationCallback = new TracklyricsexplanationCallback(ctxFunctions, msGeniusApi, msOpenAiApi)

    advConsole.log('BotFunctions started!')
  }
}
