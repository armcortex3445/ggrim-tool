import { of, concatMap, delay, tap, repeat, map, catchError } from "rxjs";
import { ListWithPagination } from "../src/api/wikiArt/interfaces";
import { appendDataToCSV, initFileWrite } from "../src/utils/csvUtils";
import { getPaintingsByArtist } from "../src/api/wikiArt/api";
import { Logger } from "../src/utils/logger";

const PaintingShortJsonKeys = [
  "id",
  "title",
  "url",
  "artistUrl",
  "artistName",
  "artistId",
  "completitionYear",
];

function createTaskObservable<T>(
  sessionKey: string,
  pageCnt: number,
  apiMethod: (
    sessionKey: string,
    pageToken: string,
    ...rest: any[]
  ) => ListWithPagination<T>,
  ApiParams: any[]
) {
  let paginationToken: string = "";
  const list$ = of(...ApiParams).pipe(
    concatMap(async (params) => {
      const response = apiMethod(sessionKey, paginationToken, ...params);
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
    repeat(pageCnt)
  );

  return list$;
}

function loadArtistPaintintgByFile(
  csvFile: string,
  reapeatCnt: number,
  artistIds: string[]
) {
  initFileWrite(csvFile, PaintingShortJsonKeys.join(",") + "\n", "utf-8");
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
        Logger.error(`[loadArtistPaintintgByFile] , ${JSON.stringify(info)}`);
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

  list$.subscribe((list) =>
    appendDataToCSV(csvFile, list, PaintingShortJsonKeys)
  );
}
