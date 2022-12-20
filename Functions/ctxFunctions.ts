import { CommandContext, Context } from "grammy";
import { AdvConsole } from "./advancedConsole";

export class CtxFunctions {
  private advConsole: AdvConsole;

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole;
  }

  async ctxReply(ctx: CommandContext<Context>, message: string) {
    await ctx.reply(message, { parse_mode: 'HTML' }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${err}`);
    });
  }
}