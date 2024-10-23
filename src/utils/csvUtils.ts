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

export async function transformCSVFileToObjectList<T>(
  fileName: string,
  validKeys: (keyof T)[]
) {
  const buffer: T[] = [];
  const p = new Promise<T[]>((res, rej) => {
    readFile(fileName, "utf-8", (err, data) => {
      Logger.debug("[transformCSVFileToObject] start");
      const rowToData = data.split("\n");
      const csvColumns = rowToData[0].split(",");
      const rowList = rowToData.slice(1, rowToData.length - 1);

      //validate validKeys
      const isValid = validKeys.every((key) =>
        csvColumns.includes(key.toString())
      );

      if (!isValid) {
        throw new Error(
          "[transformCSVFileToObject] validKeys is invalid." +
            `validKeys : ${JSON.stringify(validKeys, null, 2)}\n` +
            `csvColumns : ${JSON.stringify(csvColumns, null, 2)}\n`
        );
      }

      rowList.forEach((row, i) => {
        const eleList = row.split(",");

        const result = validKeys.reduce((obj, key) => {
          const idxOfColumns = csvColumns.indexOf(key.toString());
          obj[key] = eleList[idxOfColumns];

          return obj;
        }, {} as any);
        Logger.debug(
          "[transformCSVFileToObject] result : " + JSON.stringify(result)
        );

        buffer.push(result);
      });
      Logger.debug("[transformCSVFileToObject] end");
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
