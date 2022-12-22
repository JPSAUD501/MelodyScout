import { CommandContext, Context } from "grammy";
import { AdvConsole } from "./advancedConsole";
import { ParseMode } from "grammy/out/types";

export class CtxFunctions {
  private advConsole: AdvConsole;

  constructor (advConsole: AdvConsole) {
    this.advConsole = advConsole;
  }

  async ctxReply(ctx: CommandContext<Context>, message: string, parse_mode?: ParseMode, disableWebPagePreview?: boolean): Promise<void> {
    await ctx.reply(message, { parse_mode: parse_mode ? parse_mode : 'HTML', disable_web_page_preview: disableWebPagePreview ? disableWebPagePreview : false }).catch((err) => {
      this.advConsole.error(`MelodyScout_Bot - Error: ${err}`);
    });
  }
}