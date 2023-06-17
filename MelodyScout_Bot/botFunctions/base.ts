import { MsLastfmApi } from '../../api/msLastfmApi/base'
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
import { MsTextToSpeechApi } from '../../api/msTextToSpeechApi/base'
import { TrackAudioDownloadCallback } from './callbacks/trackaudiodownload'
import { TrackDownloadCallback } from './callbacks/trackdonwload'
import { TrackVideoDownloadCallback } from './callbacks/trackvideodownload'
import { MsRaveApi } from '../../api/msRaveApi/base'
import { MashupCommand } from './commands/mashup'
import { advLog } from '../../function/advancedConsole'

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
  mashupCommand: MashupCommand

  trackpreviewCallback: TrackpreviewCallback
  playingnowCallback: PlayingnowCallback
  tracklyricsCallback: TracklyricsCallback
  translatedtracklyricsCallback: TranslatedtracklyricsCallback
  maintenanceinformCallback: MaintenanceinformCallback
  tracklyricsexplanationCallback: TracklyricsexplanationCallback
  trackAudioDownloadCallback: TrackAudioDownloadCallback
  trackVideoDownloadCallback: TrackVideoDownloadCallback
  trackDownloadCallback: TrackDownloadCallback

  constructor (ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, msPrismaDbApi: MsPrismaDbApi, msGeniusApi: MsGeniusApi, msMusicApi: MsMusicApi, msOpenAiApi: MsOpenAiApi, msTextToSpeechApi: MsTextToSpeechApi, msRaveApi: MsRaveApi) {
    this.startCommand = new StartCommand(ctxFunctions)
    this.helpCommand = new HelpCommand(ctxFunctions)
    this.contactCommand = new ContactCommand(ctxFunctions)
    this.myuserCommand = new MyuserCommand(ctxFunctions, msLastfmApi, msPrismaDbApi)
    this.forgetmeCommand = new ForgetmeCommand(ctxFunctions, msPrismaDbApi)
    this.briefCommand = new BriefCommand(ctxFunctions, msLastfmApi, msPrismaDbApi)
    this.playingnowCommand = new PlayingnowCommand(ctxFunctions, msLastfmApi, msPrismaDbApi, msMusicApi)
    this.historyCommand = new HistoryCommand(ctxFunctions, msLastfmApi, msPrismaDbApi)
    this.pinCommand = new PinCommand(ctxFunctions)
    this.pntrackCommand = new PntrackCommand(ctxFunctions, msLastfmApi, msPrismaDbApi, msMusicApi)
    this.pnalbumCommand = new PnalbumCommand(ctxFunctions, msLastfmApi, msMusicApi, msPrismaDbApi)
    this.pnartistCommand = new PnartistCommand(ctxFunctions, msLastfmApi, msMusicApi, msPrismaDbApi)
    this.allusersCommand = new AllusersCommand(ctxFunctions, msPrismaDbApi)
    this.maintenanceCommand = new MaintenanceCommand(ctxFunctions)
    this.maintenanceinformCommand = new MaintenanceinformCommand(ctxFunctions)
    this.mashupCommand = new MashupCommand(ctxFunctions, msLastfmApi, msPrismaDbApi, msMusicApi, msRaveApi)

    this.trackAudioDownloadCallback = new TrackAudioDownloadCallback(ctxFunctions, msMusicApi)
    this.trackVideoDownloadCallback = new TrackVideoDownloadCallback(ctxFunctions, msMusicApi)
    this.trackDownloadCallback = new TrackDownloadCallback(ctxFunctions, msMusicApi)
    this.trackpreviewCallback = new TrackpreviewCallback(ctxFunctions, msMusicApi)
    this.playingnowCallback = new PlayingnowCallback(ctxFunctions, msLastfmApi, msPrismaDbApi, msMusicApi)
    this.tracklyricsCallback = new TracklyricsCallback(ctxFunctions, msGeniusApi)
    this.translatedtracklyricsCallback = new TranslatedtracklyricsCallback(ctxFunctions, msGeniusApi)
    this.maintenanceinformCallback = new MaintenanceinformCallback(ctxFunctions)
    this.tracklyricsexplanationCallback = new TracklyricsexplanationCallback(ctxFunctions, msGeniusApi, msOpenAiApi, msTextToSpeechApi)

    advLog('BotFunctions started!')
  }
}
