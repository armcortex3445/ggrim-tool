import {
  Observable,
  Observer,
  concatMap,
  delay,
  every,
  forkJoin,
  from,
  map,
  of,
  tap,
} from "rxjs";
import {
  BackendPagination,
  BackendPainting,
  ExtendedBackendPainting,
  IPaginationResult,
  Quiz,
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
import { PrimitiveQuiz } from "./backend/interface";
import { CreatePaintingDTO, CreateQuizDTO } from "../api/back-server/dto";
import { createPaintingToDB, createQuiz } from "../api/back-server/api";

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

export function runInsertQuizToBackend(
  primitiveQuizFile: string
): Promise<void> {
  return new Promise((resolve, reject) =>
    insertQuizToBackend(primitiveQuizFile, resolve, reject)
  );
}
export function insertQuizToBackend(
  primitiveQuizFile: string,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: any) => void
) {
  const primitiveQuizzes: PrimitiveQuiz[] = loadListFromJSON<PrimitiveQuiz>(
    primitiveQuizFile,
    undefined
  );
  /*사양
    - 각 퀴즈의 그림들 id 정보를 backend로부터 갖고 온다.
    - createQuizDTO를 생성한다.
    - 퀴즈 생성 요청을 백엔드에 보낸다.
    - 생성된 퀴즈를 비교한다. 
  */

  let taskLogFileName = "[task]insertsQuizToBackend.log.txt";
  let taskResultFileName = "[task]insertsQuizToBackend.result.txt";

  taskLogFileName = initFileWrite(
    taskLogFileName,
    `#inputPath=${primitiveQuizFile}\n`,
    "utf-8"
  );
  // taskResultFileName = initFileWrite(
  //   taskResultFileName,
  //   `#inputPath=${primitiveQuizFile}\n`,
  //   "utf-8"
  // );

  const task$ = getInsertQuizToDStream(primitiveQuizzes);

  const subscriber = async (restAPITest: IRestAPITest<Quiz, string>) => {
    const quiz: Quiz = restAPITest.local;
    appendFileSync(
      taskLogFileName,
      (restAPITest.apiResult || `${quiz.id} has problem`) + "\n"
    );

    //appendFileSync(taskResultFileName, `${quiz.id}${taskResult}\n`);
  };

  const observer: Observer<IRestAPITest<Quiz, string>> = {
    next: subscriber,
    error: (err: any) => {
      Logger.error(
        `[insertsQuizToBackend] Error happen. inputFile : ${primitiveQuizFile}` +
          JSON.stringify(err)
      );
      reject(err);
    },
    complete: () => {
      Logger.debug(
        `[insertsQuizToBackend] complete. inputFile : ${primitiveQuizFile}`
      );
      resolve();
    },
  };

  task$.subscribe(observer);
}
export async function getExtendPaintingID(
  painting: Painting
): Promise<string | undefined> {
  const dbPaintings: ExtendedBackendPainting[] = (
    await getExtendedBackendPaintingByPainting(painting)
  ).data;
  const targets: ExtendedBackendPainting[] = dbPaintings.filter(
    (dbPainting) => dbPainting.image_url === painting.image
  );

  if (targets.length === 0) {
    Logger.info(`${painting.id} is not inserted to DB`);
    return undefined;
  }

  if (targets.length > 1) {
    Logger.info(`${painting.id} is inserted more than once`);
  }
  return targets[0].id;
}

function getExtendPaintingIDByProcessing(
  painting: Painting
): Observable<string> {
  return from(insertPaintingWhenNotExist(painting)).pipe(
    concatMap(() => from(getExtendPaintingID(painting) as Promise<string>))
  );
}

function getInsertQuizToDStream(primitiveQuizzes: PrimitiveQuiz[]) {
  /*사양
  1. Primitive 퀴즈 삽입
  2. 각 퀴즈에 대해 다음 동작 진행
    - answer, distractor id 얻기
    - createQuizDTO 만들기
    - 퀴즈 생성하기
  3. 생성된 퀴즈 유효성 검사하기

  */
  const delayMS = 1000;
  const task$: Observable<IRestAPITest<Quiz, string>> = of(
    ...primitiveQuizzes
  ).pipe(
    concatMap((primitiveQuiz) => {
      const result: IRestAPITest<PrimitiveQuiz, string> = {
        local: primitiveQuiz,
        apiResult: primitiveQuiz.description,
      };
      return of(result).pipe(delay(delayMS));
    }),
    concatMap((input: IRestAPITest<PrimitiveQuiz, string>) => {
      const primitiveQuiz = input.local;
      Logger.debug(`process${primitiveQuiz.description}`);
      let log: string = input.apiResult || "";
      const answers: Painting[] = [...primitiveQuiz.answer];
      const distractors: Painting[] = [...primitiveQuiz.distractor];

      const answerIds$: Observable<string[]> = forkJoin(
        answers.map(getExtendPaintingIDByProcessing)
      );
      const distractorIds$: Observable<string[]> = forkJoin(
        distractors.map(getExtendPaintingIDByProcessing)
      );

      return forkJoin([answerIds$, distractorIds$]).pipe(
        map(([answerIds, distractorIds]) => {
          const createQuizDTO: CreateQuizDTO = {
            answerPaintingIds: answerIds,
            distractorPaintingIds: distractorIds,
            timeLimit: 40,
            type: "ONE_CHOICE",
            description: primitiveQuiz.description,
            title: primitiveQuiz.description,
          };
          return {
            local: createQuizDTO,
            apiResult: log + `\n\tcreate Quiz DTO`,
          } as IRestAPITest<CreateQuizDTO, string>;
        }),
        delay(delayMS)
      );
    }),
    concatMap((input) => {
      const dto: CreateQuizDTO = input.local;

      return from(createQuiz(dto)).pipe(
        map((quiz) => {
          return {
            local: quiz,
            apiResult: input.apiResult + `\n\t create quiz ${quiz.id}`,
          } as IRestAPITest<Quiz, string>;
        })
      );
    })
  );

  return task$;
}
