import { Observable, catchError, concatMap, delay, map, of, tap } from "rxjs";
import { Logger } from "../utils/logger";
import { promises } from "fs";
import { initFileWrite } from "../utils/file";
import { loadObjectFromJSON } from "../utils/jsonUtils";

export function createTaskObeservable<T, R>(
  inputList: R[],
  apiMethod: (list: R, ...params: any[]) => Promise<T>,
  optionalParams?: any[]
) {
  Logger.debug("[getTaskObeservable] : total lenth is " + inputList.length);

  const task$: Observable<T> = of(...inputList).pipe(
    tap((input) => Logger.info("[input] : " + JSON.stringify(input, null, 2))),
    delay(1000),
    concatMap((input) => apiMethod(input, optionalParams)),
    catchError((err) => {
      Logger.warn("getPaintingDetails stop." + JSON.stringify(err, null, 2));
      throw err;
    })
  );

  return task$;
}
