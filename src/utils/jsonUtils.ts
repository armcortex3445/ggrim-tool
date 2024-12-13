import { createReadStream, readFileSync } from "fs";
import { Logger } from "./logger";
import { IdentifierInterface } from "./interface/interface";

export function loadObjectFromJSON<T>(inputJSON: string) {
  const readfilePath = inputJSON;
  const buffer = readFileSync(readfilePath, "utf-8");
  const objs = JSON.parse(buffer) as T;

  return objs;
}

export function loadListFromJSON<T>(
  intputJSON: string,
  breakPoint?: IdentifierInterface<T>
) {
  const list: T[] = loadObjectFromJSON<T[]>(intputJSON);
  const NOT_FOUND = -1;
  const idx =
    breakPoint != undefined
      ? list.findIndex(
          (val) => val[breakPoint.identifierKey] === breakPoint.identifier
        )
      : NOT_FOUND;
  Logger.debug(
    `[${loadListFromJSON.name}] breakPoint : ${JSON.stringify(
      breakPoint,
      null,
      2
    )}\nidx is : ${idx}`
  );

  const sublist = list.slice(idx !== NOT_FOUND ? idx : 0);

  Logger.info(
    "[saveDatatoJSONFile] : total lenth is " +
      list.length +
      ". restart lenth is " +
      sublist.length
  );

  return sublist;
}

//This function is for reorder to format [ {}, {} ,{}] from unproper format {}{}{}
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
