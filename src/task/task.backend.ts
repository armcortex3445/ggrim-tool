import { Observable, Observer, concatMap, every, of, tap } from "rxjs";
import {
  ExtendedBackendPainting,
  IPaginationResult,
} from "../api/back-server/type";
import { Painting } from "../api/wikiArt/interfaces";
import { Logger } from "../utils/logger";
import {
  IRestAPITest,
  getTaskForRestAPITest$,
  getTaskForValidateRestAPI$,
} from "./task.test.api";
import { validatePaintingFromDB } from "./backend/validation";
import { initFileWrite } from "../utils/file";
import { appendFileSync } from "fs";
import { loadListFromJSON } from "../utils/jsonUtils";
import {
  getExtendedBackendPaintingByPainting,
  insertArtistWhenNotExisted,
  insertPaintingWhenNotExist,
  insertStyleWhenNotExist,
  insertTagWhenNotExist,
} from "./backend/api";

export function runInsertPaintingParallel(paintingFile: string) {
  /*TODO
  - 다음 로직 구현하기
    - 입력된 그림의 모든 태그를 삽입 후, 모든 작가 삽입 후, 모든 스타일 삽입 후, 모든 그림 삽입하기
    - 각 각 삽입 단계는 순착적이되, 각 단계의 데이터 삽입은 동시에 처리되도록 하기
      =>  insertArtistWhenNotExisted() 를 모든 작가에 대해 동시에 실행하라는 의미.
    - 이후 각 그림에 대해 수행 검증 결과 로직 적용.
*/
}

export function runInsertPaintingStepByStep(
  paintingFile: string
): Promise<void> {
  return new Promise((resolve, reject) =>
    insertPaintingStepByStep(paintingFile, resolve, reject)
  );
}

export function insertPaintingStepByStep(
  paintingFile: string,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: any) => void
) {
  /*로직 설계
  1. [x]작가 존재확인 및 삽입
  2. [x]태그 존재 확인 및 삽입
  3. [x]스타일 존재 확인 및 삽입
  4. [x]그림 존재 확인 및 삽입
  5. []테스트 진행
  6. []수행 검증 결과 로직 적용
  7
  */

  const paintings: Painting[] = loadListFromJSON<Painting>(
    paintingFile,
    undefined
  );
  const restAPITests: IRestAPITest<Painting, string>[] = paintings.map(
    (painting) => {
      const restAPITest: IRestAPITest<Painting, string> = {
        local: painting,
        apiResult: `${painting.id}`,
      };
      return restAPITest;
    }
  );

  let taskLogFileName = "[task]insertPainting.log.txt";
  let taskResultFileName = "[task]insertPainting.result.txt";

  taskLogFileName = initFileWrite(
    taskLogFileName,
    `#inputPath=${paintingFile}\n`,
    "utf-8"
  );
  taskResultFileName = initFileWrite(
    taskResultFileName,
    `#inputPath=${paintingFile}\n`,
    "utf-8"
  );

  const task$: Observable<IRestAPITest<Painting, string>> = of(
    ...restAPITests
  ).pipe(
    concatMap(async (restAPITest) => {
      const painting = restAPITest.local;
      Logger.debug(`process painting. id : ${painting.id}`);
      const result: string = await insertArtistWhenNotExisted(
        painting.artistName
      );

      if (result.length !== 0) {
        restAPITest.apiResult += "\n\t";
        restAPITest.apiResult += result;
      }
      return restAPITest;
    }),
    concatMap(async (restAPITest) => {
      const painting = restAPITest.local;
      restAPITest.apiResult += "\n\t#Insert Tag";
      for (const tag of painting.tags) {
        const result: string = await insertTagWhenNotExist(tag);
        if (result.length !== 0) {
          restAPITest.apiResult += "\n\t\t";
          restAPITest.apiResult += result;
        }
      }

      return restAPITest;
    }),
    concatMap(async (restAPITest) => {
      const painting = restAPITest.local;
      restAPITest.apiResult += "\n\t#Insert Style";
      for (const style of painting.styles) {
        const result: string = await insertStyleWhenNotExist(style);
        if (result.length !== 0) {
          restAPITest.apiResult += "\n\t\t";
          restAPITest.apiResult += result;
        }
      }
      return restAPITest;
    }),
    concatMap(async (restAPITest) => {
      const painting = restAPITest.local;
      const result = await insertPaintingWhenNotExist(painting);

      if (result.length !== 0) {
        restAPITest.apiResult += "\n\t";
        restAPITest.apiResult += result;
      }

      return restAPITest;
    })
  );

  const subscriber = async (restAPITest: IRestAPITest<Painting, string>) => {
    const painting = restAPITest.local;
    appendFileSync(
      taskLogFileName,
      (restAPITest.apiResult || `${painting.id} has problem`) + "\n"
    );

    const createdData: IPaginationResult<ExtendedBackendPainting> =
      await getExtendedBackendPaintingByPainting(painting);

    const taskResult = validatePaintingFromDB(painting, createdData);
    appendFileSync(taskResultFileName, `${painting.id}${taskResult}\n`);
  };

  const observer: Observer<IRestAPITest<Painting, string>> = {
    next: subscriber,
    error: (err: any) => {
      Logger.error(
        `[runInsertPaintingStepByStep] Error happen. inputFile : ${paintingFile}` +
          JSON.stringify(err)
      );
      reject(err);
    },
    complete: () => {
      Logger.debug(
        `[runInsertPaintingStepByStep] complete. inputFile : ${paintingFile}`
      );
      resolve();
    },
  };

  task$.subscribe(observer);
}

export function testGetPaintingAPI(paintings: Painting[]) {
  Logger.info("[testGetPaintingAPI] start");

  //하나의 데이터 api 전송해서 실패 / 성공 반환 타입 확인하기

  // task
  const outputFile = `[task]TestGetPaintingAPI.txt`;

  const identifier: keyof Painting = "id";
  const task$ = getTaskForRestAPITest$<
    Painting,
    IPaginationResult<ExtendedBackendPainting>
  >(paintings, identifier, getExtendedBackendPaintingByPainting, 100);

  const taskWithTest$ = getTaskForValidateRestAPI$<
    Painting,
    IPaginationResult<ExtendedBackendPainting>
  >(task$, identifier, validatePaintingFromDB, outputFile);

  taskWithTest$.subscribe((result) =>
    Logger.debug(`${result.local[identifier]} is done`)
  );
}
