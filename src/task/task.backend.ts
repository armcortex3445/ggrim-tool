import {
  IPainting,
  IResult,
  WikiArtPainting,
  getPaintingDTO,
  getPaintingFromDB,
} from "../api/back-server/api";
import {
  SearchPaintingDTO,
} from "../api/back-server/dto";
import {
  BackendArtist,
  BackendPainting,
  ExtendedBackendPainting,
  IPaginationResult,
} from "../api/back-server/type";
import { Painting } from "../api/wikiArt/interfaces";
import { Logger } from "../utils/logger";
import {
  getTaskForRestAPITest$,
  getTaskForValidateRestAPI$,
} from "./task.test.api";
import { validatePaintingFromDB } from "./backend/validation";

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

  ///////////////////////////////////////////
}
