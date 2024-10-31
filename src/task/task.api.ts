import { Observable, catchError, concatMap, delay, map, of, tap } from "rxjs";
import { Logger } from "../utils/logger";
import { promises } from "fs";
import { initFileWrite } from "../utils/file";
import { loadObjectFromJSON } from "../utils/jsonUtils";

export function getTaskObeservable$<T, R>(
  inputList: T[],
  apiMethod: (input: T, ...params: any[]) => Promise<R>,
  delayMiliSecond: number = 1000,
  optionalParams?: any[]
) {
  Logger.debug("[getTaskObeservable] : total lenth is " + inputList.length);

  const task$: Observable<R> = of(...inputList).pipe(
    tap((input) => Logger.info("[input] : " + JSON.stringify(input, null, 2))),
    delay(delayMiliSecond),
    concatMap((input) => apiMethod(input, optionalParams)),
    catchError((err) => {
      Logger.warn("getPaintingDetails stop." + JSON.stringify(err, null, 2));
      throw err;
    })
  );

  return task$;
}
