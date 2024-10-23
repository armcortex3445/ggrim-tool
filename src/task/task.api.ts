import { catchError, concatMap, delay, map, of, tap } from "rxjs";
import { initFileWrite } from "../utils/csvUtils";
import { Logger } from "../utils/logger";
import { promises } from "fs";

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
        Logger.warn("appendFile stop." + JSON.stringify(result, null, 2)) + ",";
        Logger.error(e);
      })
  );

  return targetPath;
}
