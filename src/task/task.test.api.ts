import { Observable, concatMap, delay, map, of, tap, timer } from "rxjs";
import { Logger } from "../utils/logger";
import { initFileWrite } from "../utils/file";
import { CustomError } from "../utils/error";
import { appendFileSync, existsSync } from "fs";
import { wait } from "../utils/execution";

export interface IRestAPITest<T, R> {
  local: T;
  apiResult?: R;
}

export function getTaskForRestAPITest$<T, R>(
  localDataList: T[],
  identifierKey: keyof T,
  restAPI: (local: T, ...args: any[]) => Promise<R>,
  delayMilliSecond: number = 1000,
  optionalArgs?: any[]
) {
  Logger.info("[getTaskForRestAPITest] start");
  const SECOND_PER_MS = 1000;

  const task$ = of(...localDataList).pipe(
    concatMap((value) =>
      timer(delayMilliSecond).pipe(
        // timer가 끝난 후 실제 데이터를 반환
        concatMap(() => of(value))
      )
    ),
    map((localData, index) => {
      Logger.debug("start test");

      const ctx: IRestAPITest<T, R> = {
        local: localData,
      };

      return ctx;
    }),
    concatMap(async (ctx) => {
      Logger.debug(`id : ${ctx.local[identifierKey]}`);
      const result = restAPI(ctx.local, optionalArgs);
      ctx.apiResult = await result;
      wait(delayMilliSecond);
      return ctx;
    }),
    tap((ctx) =>
      Logger.debug(
        `${ctx.local[identifierKey]} is done. ${JSON.stringify(
          ctx.apiResult,
          null,
          2
        )}`
      )
    )
  );

  return task$;
}

/*
create testResult.tsv which showing two columns [indertifierKey, validation].
  indertifierKey : 
*/
export function getTaskForValidateRestAPI$<T, R>(
  task$: Observable<IRestAPITest<T, R>>,
  identifierKey: keyof T,
  validateFunc: (val1: T, val2: R) => string,
  outputTSVFile: string = `./testResult.tsv`
) {
  const columns = [identifierKey, "validation"];

  return task$.pipe(
    map((ctx) => {
      const arr: any[] = [ctx.local[identifierKey]];

      if (!ctx.apiResult) {
        throw new CustomError(
          getTaskForValidateRestAPI$.name,
          "INTERNAL_LOGIC",
          `apiReulst is falsy.\n ${JSON.stringify(ctx.apiResult)}`
        );
      }
      const validation = validateFunc(ctx.local, ctx.apiResult!!);
      arr.push(validation);

      if (!existsSync(outputTSVFile)) {
        initFileWrite(outputTSVFile, arr.join("\t") + "\n", "utf-8");
      }

      appendFileSync(outputTSVFile, arr.join("\t") + "\n", "utf-8");

      return ctx;
    })
  );
}
