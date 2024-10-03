import {
  appendFile,
  readFile,
  promises,
  writeFile,
  existsSync,
  writeFileSync,
  WriteFileOptions,
} from "fs";
import { checkEncoding } from "./validation";
import { Logger } from "./logger";
import { catchError, concatMap, delay, map, of, tap } from "rxjs";

export async function transformCSVFileToObject<T>(fileName: string) {
  const buffer: T[] = [];
  const p = new Promise<T[]>((res, rej) => {
    readFile("./" + fileName, "utf-8", (err, data) => {
      const rowToData = data.split("\n");
      const dataKeys = rowToData[0].split(",");
      const rowList = rowToData.slice(1, rowToData.length - 1);

      rowList.forEach((row, i) => {
        const obj = row.split(",").reduce((object, val, idx) => {
          object[dataKeys[idx]] = val;
          return object;
        }, {} as any);
        buffer.push(obj);
      });
      res(buffer);
    });
  });

  return p;
}

export function appendDataToCSV<T>(
  file: string,
  datalist: T[],
  columns: string[]
) {
  console.log("write Data");
  const csv: string[] = [];

  datalist.forEach((data) => {
    const csvData = transformToCSV(data, columns);

    csv.push(csvData);
  });

  if (datalist.length > 0) {
    appendFile(file, csv.join("\n") + "\n", (err) => {
      if (err) throw err;
    });
  }

  console.log("write end");
}

function transformComma(str: string) {
  const ret = str.replace(/,/g, "+");

  return ret;
}

function transformToCSV(obj: any, keys: string[]) {
  const arr: string[] = [];

  keys.forEach((key) => {
    if (!(key in obj)) {
      console.log(
        `${key} key is not exist in obj : ${JSON.stringify(obj, null, 2)}`
      );
      throw new Error(`transformCSV error`);
    }

    const str = transformComma(
      typeof obj[key] === "string" ? obj[key] : JSON.stringify(obj[key])
    );
    checkEncoding(str);

    arr.push(str);
  });

  return arr.join(",");
}

export function initFileWrite(
  outputFile: string,
  initValue: string,
  options: WriteFileOptions
) {
  let name = outputFile;
  if (existsSync(outputFile)) {
    name = getFileNumber(name);
  }

  Logger.debug(name);
  writeFileSync(name, initValue, options);

  function getFileNumber(fileName: string, num: number = 2) {
    const ret = fileName + "-" + num;

    if (existsSync(ret)) return getFileNumber(fileName, ++num);

    return ret;
  }

  Logger.info("init end. file name is " + name);

  return name;
}

namespace json {
  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * saveDatatoJSONFile - Save data to JSON file with restart functionality.
   * @param outputFile - The name of the output file.
   * @param sessionKey - The session key of the API.
   * @param breakPoint - The point to restart from.
   * @param apiMethod - The API method to call.
   * @param apiParams - The parameters of the API.
   * @param processMethod - The method to process the API result.
   * @returns The path of the output file.
   */
  /******  961d98dd-3634-444f-a3f1-a87285f13622  *******/
  function saveDatatoJSONFile(
    outputFile: string,
    sessionKey: string,
    breakPoint: any,
    apiMethod: (sessionKey: string, ...params: any[]) => any[],
    apiParams: any[],
    processMethod: (apiValue: any) => any
  ) {
    const startJson = "[",
      endJSON = "]"; // manually do this.
    const targetPath = initFileWrite(outputFile, startJson, "utf-8");

    const idx = apiParams.indexOf(breakPoint);
    const NOT_FOUND = -1;
    const list = apiParams.slice(idx !== NOT_FOUND ? idx : 0);
    Logger.debug(
      "[saveDatatoJSONFile] : total lenth is " +
        list.length +
        ". restart lenth is " +
        apiParams.length
    );

    const apiResults$ = of(...list).pipe(
      tap((v) => Logger.debug("Painting Short Info : " + JSON.stringify(v))),
      delay(1000),
      concatMap((info) => apiMethod(sessionKey, ...info)),
      map((v) => processMethod(v)),
      catchError((err) => {
        Logger.warn("getPaintingDetails stop." + JSON.stringify(err, null, 2));
        throw err;
      })
    );

    apiResults$.subscribe((result) =>
      promises
        .appendFile(targetPath, JSON.stringify(result, null, 2) + ",", "utf-8")
        .catch((e) => {
          Logger.warn("appendFile stop." + JSON.stringify(result, null, 2)) +
            ",";
          Logger.error(e);
        })
    );

    return targetPath;
  }
}
