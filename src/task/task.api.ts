import {
  Observable,
  catchError,
  concatMap,
  delay,
  map,
  of,
  tap,
  timer,
} from "rxjs";
import { Logger } from "../utils/logger";
import { promises } from "fs";
import { initFileWrite } from "../utils/file";
import { loadObjectFromJSON } from "../utils/jsonUtils";
import { wait } from "../utils/execution";

export function getTaskObeservable$<T, R>(
  inputList: T[],
  apiMethod: (input: T, ...params: any[]) => Promise<R>,
  delayMiliSecond: number = 1000,
  optionalParams?: any[]
) {
  Logger.debug("[getTaskObeservable] : total lenth is " + inputList.length);
  const API_INTERVAL_MS = 4000;

  const task$: Observable<R> = of(...inputList).pipe(
    concatMap((value) =>
      timer(delayMiliSecond).pipe(
        // timer가 끝난 후 실제 데이터를 반환
        concatMap(() => of(value))
      )
    ),
    //tap((input) => Logger.info("[input] : " + JSON.stringify(input, null, 2))),
    concatMap(async (input) => {
      const result = await apiMethod(input, optionalParams);
      wait(API_INTERVAL_MS);
      return result;
    }),
    catchError((err) => {
      Logger.warn("getPaintingDetails stop." + JSON.stringify(err, null, 2));
      throw err;
    })
  );

  return task$;
}
