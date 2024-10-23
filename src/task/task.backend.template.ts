import { appendFile, appendFileSync, readFileSync } from "fs";
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
  concat,
} from "rxjs";
import { Artist, Painting } from "../api/wikiArt/interfaces";
import { Logger } from "../utils/logger";
import {
  IPainting,
  IResult,
  IResultCreatePatining,
  IUpdateInfo,
  createArtistToDB,
  updateWikiArtistPaintingToDB,
} from "../api/back-server/api";
import { loadObjectFromJSON } from "../utils/jsonUtils";
import { identifierToKeywordKind } from "typescript";
import { initFileWrite } from "../utils/file";
import { CustomError } from "../utils/error";

export interface ITestResult<T, R, D> {
  inputDto: T;
  createResult: R;
  getResult?: D | null;
}

export async function sendRequestWithTest<T, R, D, K>(
  dtoList: T[],
  dtoIdentifierKey: keyof T,
  createApi: (dto: T, ...args: any[]) => R,
  extractGetApiDTO: (createApiResult: R, dto: T) => D,
  getApi: (dto: D, ...args: any[]) => K,
  validateFunc: (dto: T, getApiReulst: K) => boolean,
  createApiOptionalArgs?: any[],
  getApiOptionalArgs?: any[]
) {
  const outputFile = "./testResult.tsv";
  const testResultFileColumns = [dtoIdentifierKey, "isValid"];
  const finalOutputFile = initFileWrite(
    outputFile,
    testResultFileColumns.join("\t") + "\n",
    "utf-8"
  );

  //do craeta and get
  const task$ = of(...dtoList).pipe(
    concatMap(async (dto) => {
      Logger.debug("-------start task------------");
      Logger.info(`Dto : ${dto[dtoIdentifierKey]}`);

      const result = await createApi(dto, createApiOptionalArgs);
      const taskResult: ITestResult<T, R, K> = {
        inputDto: dto,
        createResult: result,
        getResult: null,
      };
      return taskResult;
    }),
    concatMap(async (taskRes) => {
      Logger.info(`Test ${taskRes.inputDto[dtoIdentifierKey]}`);

      const dto = extractGetApiDTO(taskRes.createResult, taskRes.inputDto);

      const result = await getApi(dto, getApiOptionalArgs);

      return { ...taskRes, getResult: result } as ITestResult<T, R, K>;
    }),
    catchError((e) => {
      Logger.error(
        "observable task is failed" + JSON.stringify(e.stack, null, 2)
      );
      throw e;
    })
  );

  //do validate
  task$.subscribe((taskResult) => {
    const list: string[] = [];
    const idf = JSON.stringify(taskResult.inputDto[dtoIdentifierKey]);

    Logger.debug(`#Start validate. id : ${idf} `);

    const isPass = validateFunc(taskResult.inputDto, taskResult.getResult!);

    list.push(`${idf}`);
    list.push(isPass ? "O" : "X");

    const writeBuf = list.join("\t") + "\n";
    Logger.debug("writeBuf = " + writeBuf);

    appendFile(finalOutputFile, writeBuf, "utf-8", (err) => {
      if (err) {
        Logger.error(
          "writing " + idf + "is failed." + "write Buff is " + writeBuf
        );
        throw new Error("appendFile is failed");
      }
    });
  });
}

interface IGETMethodCTX<T, R> {
  local: T;
  apiResult?: R;
}

export function runGetMethod<T, R>(
  localDataList: T[],
  identifierKey: keyof T,
  getApi: (local: T, ...args: any[]) => Promise<R>,
  getApiOptionalArgs?: any[]
) {
  Logger.info("[runGetMethod] start");

  const task$ = of(...localDataList).pipe(
    map((localData, index) => {
      Logger.debug("start test");

      const ctx: IGETMethodCTX<T, R> = {
        local: localData,
      };

      return ctx;
    }),
    concatMap(async (ctx) => {
      Logger.debug(`id : ${ctx.local[identifierKey]}`);
      const result = getApi(ctx.local, getApiOptionalArgs);
      ctx.apiResult = await result;
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

export function testGetAPI<T, R>(
  task$: Observable<IGETMethodCTX<T, R>>,
  identifierKey: keyof T,
  validateFunc: (val1: T, val2: R) => string
) {
  const outPutFile = "./testResult.tsv";
  const columns = [identifierKey, "validation"];
  const output = initFileWrite(outPutFile, columns.join("\t") + "\n", "utf-8");

  task$.subscribe((ctx) => {
    const arr: any[] = [ctx.local[identifierKey]];

    if (!ctx.apiResult) {
      throw new CustomError(
        testGetAPI.name,
        "INTERNAL_LOGIC",
        `apiReulst is falsy.\n ${JSON.stringify(ctx.apiResult)}`
      );
    }
    const validation = validateFunc(ctx.local, ctx.apiResult!!);
    arr.push(validation);

    appendFileSync(output, arr.join("\t") + "\n", "utf-8");
  });
}
