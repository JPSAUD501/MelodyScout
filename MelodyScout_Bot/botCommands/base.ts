import { MsLastfmApi } from '../../api/msLastfmApi/base'
import { AdvConsole } from '../../functions/advancedConsole'
import { PrismaDB } from '../../functions/prismaDB/base'
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
import { CtxFunctions } from '../../functions/ctxFunctions'
import { HistoryCommand } from './commands/history'

export class BotCommands {
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

  constructor (advConsole: AdvConsole, ctxFunctions: CtxFunctions, msLastfmApi: MsLastfmApi, prismaDB: PrismaDB) {
    this.startCommand = new StartCommand(ctxFunctions)
    this.helpCommand = new HelpCommand(ctxFunctions)
    this.trackCommand = new TrackCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.untrackCommand = new UntrackCommand(ctxFunctions, prismaDB)
    this.tracklistCommand = new TracklistCommand(ctxFunctions, prismaDB)
    this.contactCommand = new ContactCommand(ctxFunctions)
    this.myuserCommand = new MyuserCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.forgetmeCommand = new ForgetmeCommand(ctxFunctions, prismaDB)
    this.briefCommand = new BriefCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.playingnowCommand = new PlayingnowCommand(ctxFunctions, msLastfmApi, prismaDB)
    this.historyCommand = new HistoryCommand(ctxFunctions, msLastfmApi, prismaDB)
  }
}
