import { AdvConsole } from "./Functions/advancedConsole";
import { Server } from "./Server/server";
import { TrackerManLogBot } from "./TrackerManLog_Bot/bot";
import { TrackerManBot } from "./TrackerMan_Bot/bot";

class StartSequence {
  static async start() {
    console.log("Starting TrackerManLog_Bot and AdvConsole...");
    const trackerManLogBot = new TrackerManLogBot();
    await trackerManLogBot.start();
    const advConsole = new AdvConsole(trackerManLogBot);
    console.log("TrackerManLog_Bot and AdvConsole started!");

    advConsole.log(`Running the start sequence...`);
    const server = new Server(advConsole);
    await server.start();
    const trackerManBot = new TrackerManBot(advConsole);
    await trackerManBot.start();
    await trackerManBot.hear();
    advConsole.log(`Start sequence completed`);
  }
}

StartSequence.start();
