import {
  getPaintingDetails,
  getMostViewedPaintings,
  getPaintingsByArtist,
  getSessionId,
} from "./api/wikiArt/api";
import {
  Observable,
  concatMap,
  map,
  mergeMap,
  tap,
  from,
  interval,
  delay,
  repeat,
  of,
  catchError,
} from "rxjs";
import {
  ListWithPagination,
  PaintingShortJson,
} from "./api/wikiArt/interfaces";
import {
  appendFile,
  createReadStream,
  existsSync,
  promises,
  readFile,
  writeFile,
  writeFileSync,
} from "fs";
import path = require("path");
import { checkEncoding } from "./utils/validation";
import { Logger } from "./utils/logger";

const sessionKey = `15de050dfe00`;
const dataFormat = "utf-8";

async function main() {
  Logger.info("app start");

  const readfilePath = "./csvData/detailedMostViewedPaiting-2.json";
  const outputFile = "./csvData/detailedMostViewed-2.json";

  reorderJSON(readfilePath).then((objList) => {
    //Logger.info(JSON.stringify())
    Logger.debug(`Array size is ${objList.length}`);
    writeFileSync(outputFile, JSON.stringify(objList), dataFormat);
  });
}

async function reorderJSON(readJSONFile: string) {
  const arr: any[] = [];
  let buffer = "";

  const readStream = createReadStream(readJSONFile, "utf-8");
  //readStream.setEncoding("utf-8");
  readStream.on("data", (chunk) => {
    buffer += chunk;
    Logger.debug(
      "get Chunk. type is " + typeof chunk + ` length is ${chunk.length}`
    );
    doPrase();
  });

  function doPrase() {
    let depth = 0;
    Logger.debug(
      "doParse : " + JSON.stringify({ length: buffer.length, depth }, null, 2)
    );
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];

      if (char === "{") {
        depth++;
        const debugObj = { str: buffer.slice(i, i + 100), depth };
        // Logger.debug(
        //   "Open brasket is found." + JSON.stringify(debugObj, null, 2)
        // );
      } else if (char === "}") {
        depth--;
        const debugObj = { str: buffer.slice(i, i + 100), depth };
        // Logger.debug(
        //   "} is found. Depth is " + JSON.stringify(debugObj, null, 2)
        // );
      }
      if (depth === 0 && char === "}") {
        const jsonStr = buffer.slice(0, i + 1);
        try {
          const obj = JSON.parse(jsonStr);
          //Logger.debug(`Parsed Result ${num++}` + JSON.stringify(obj, null, 2));
          arr.push(obj);
        } catch (e) {
          Logger.warn("JSON parsing Error");
          throw e;
        }
        buffer = buffer.slice(i + 1);
        i = -1;
      }
    }

    Logger.debug(
      "End Prase : " + JSON.stringify({ length: buffer.length, depth }, null, 2)
    );
  }

  return new Promise<any[]>((resolve, reject) => {
    readStream.on("end", () => {
      Logger.debug("Before parse, buffer is " + buffer.length);
      doPrase();
      Logger.debug("After parse, buffer is " + buffer.length);
      if (buffer.length > 0)
        Logger.debug(
          "Need to check readFile. precondition is wrong.\n" +
            `wrong Context is ${buffer.slice(1, 100)}...`
        );
      resolve(arr);
    });
    readStream.on("error", (err) =>
      Logger.error("reorderJSON Error on  readStream.")
    );
  });
}

main();
