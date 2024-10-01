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
import { appendFile, promises, readFile, writeFile } from "fs";
import path = require("path");
import { checkEncoding } from "./utils/validation";
import { Logger } from "./utils/logger";

const sessionKey = `b428076ae175`;
const dataFormat = "utf-8";

const PaintingShortJsonKeys = [
  "id",
  "title",
  "url",
  "artistUrl",
  "artistName",
  "artistId",
  "completitionYear",
];

async function main() {
  Logger.info("app start");
}

function readPaintingShortInfoCSV(srcFile: string) {
  return readData(srcFile).then((objList) => {
    const set = new Set<string>();
    objList.forEach((obj) => {
      set.add(obj.artistId);
    });

    return set;
  });
}

function loadArtistPaintintgByFile(
  fileName: string,
  reapeatCnt: number,
  artistIds: string[]
) {
  init(fileName, PaintingShortJsonKeys);
  let paginationToken = "";
  let cnt = 1;

  const list$ = of(...artistIds).pipe(
    concatMap(async (artistId) =>
      getPaintingsByArtist(artistId, paginationToken)
    ),
    delay(2000),
    map((info) => {
      if ("data" in info) {
        paginationToken = info.paginationToken || "";
        return info.data;
      } else {
        throw new Error("getPaintingsByArtist failed");
      }
    }),
    tap((v) => {
      console.log(`try ${cnt++} : success. size is ${v.length}`);
    }),
    repeat(reapeatCnt),
    catchError((err) => {
      console.log(
        `loadArtistPaintintg failed. ${JSON.stringify(err, null, 2)}`
      );
      throw err;
    })
  );

  list$.subscribe((list) => writeData(fileName, list));
}

function loadMostViewsPaintingByFile(fileName: string, repeat: number) {
  init(fileName, PaintingShortJsonKeys);

  const list$ = createTaskObservable(sessionKey, repeat);

  list$.subscribe((list) => {
    writeData(fileName, list);
  });
}
function createTaskObservable(sessionKey: string, repeatCnt: number) {
  let paginationToken: string = "";
  const list$ = of({ sessionKey }).pipe(
    concatMap(async ({ sessionKey }) => {
      const response = getMostViewedPaintings(sessionKey, paginationToken);
      const info = await response;

      if ("data" in info) {
        if (!info.hasMore) throw new Error("Stop");

        paginationToken = info.paginationToken || "";
        return info.data;
      } else throw new Error("getMostViewedPaintings failed");
    }),
    delay(1000),
    tap((datas) => {
      console.log(`data length : ${datas.length}`);
      return datas;
    }),
    repeat(repeatCnt)
  );

  return list$;
}

function init(output: string, keys: string[]) {
  const msg = "init error";

  promises
    .readFile(output, "utf-8")
    .then((buffer) => {
      const columns = buffer.split("\n")[0];

      if (columns !== keys.join(",")) {
        console.log(`please check file contents. file columns is ${columns}`);
        throw new Error(msg);
      }
    })
    .catch((reason) => {
      console.log("init teset ", reason);
      if (reason.code === `ENOENT`)
        writeFile(output, keys.join(",") + "\n", (err) => {
          if (err) throw err;
        });
    })
    .finally(() => console.log("init end"));
}

function writeData(file: string, datalist: PaintingShortJson[]) {
  console.log("write Data");
  const csv: string[] = [];

  datalist.forEach((data) => {
    const csvData = transformCSV(data, PaintingShortJsonKeys);

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

function transformCSV(obj: any, keys: string[]) {
  const arr: string[] = [];

  keys.forEach((key) => {
    if (!(key in obj)) {
      console.log(
        `${key} key is not exist in obj : ${JSON.stringify(obj, null, 2)}`
      );
      throw new Error(`transformCSV error`);
    }

    const str = transformComma(JSON.stringify(obj[key]));

    checkEncoding(str);

    arr.push(str);
  });

  return arr.join(",");
}

async function readData(fileName: string) {
  const buffer: PaintingShortJson[] = [];
  const p = new Promise<PaintingShortJson[]>((res, rej) => {
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

main();
