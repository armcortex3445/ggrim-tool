import {
  ConnectResult,
  Options,
  PageWithCursor,
  connect,
} from "puppeteer-real-browser";
import { CustomError } from "./error";
import { Logger } from "./logger";
export class Scriptor {
  connectDefaultOption = {
    headless: false,

    args: [],

    customConfig: {},

    turnstile: true,

    connectOption: {},

    disableXvfb: false,
    ignoreAllFlags: false,
    // proxy:{
    //     host:'<proxy-host>',
    //     port:'<proxy-port>',
    //     username:'<proxy-username>',
    //     password:'<proxy-password>'
    // }
  };

  connector!: ConnectResult;

  async getDataBypassAntiBot(
    url: string,
    browserTask: () => any,
    option?: Options
  ): Promise<any> {
    try {
      if (!this.connector) {
        this.connector = await this.initBrowser(option);
      }
      await this.connector.page.goto(url, { waitUntil: "networkidle2" });

      const data = await this.connector.page.evaluate(browserTask);

      return data;
    } catch (error: any) {
      Logger.error(`[getDataBypassAntiBot] ${JSON.stringify(error)}`);
      throw new CustomError(
        this.getDataBypassAntiBot.name,
        "INTERNAL_LOGIC",
        `${JSON.stringify(error)}`
      );
    }
  }

  getBrowserInnerText() {
    return (document as Document).body.innerText;
  }

  async initBrowser(option?: Options): Promise<ConnectResult> {
    const connectOption = option || this.connectDefaultOption;

    const result: ConnectResult = await connect(connectOption);
    return result;
  }
}
