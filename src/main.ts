import {
  getPaintingDetails,
  getMostViewedPaintings,
  getPaintingsByArtist,
  getSessionId,
} from "./api/wikiArt/api";
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
import {
  ListWithPagination,
  Painting,
  PaintingShortJson,
} from "./api/wikiArt/interfaces";
import {
  appendFile,
  appendFileSync,
  createReadStream,
  existsSync,
  promises,
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
} from "fs";
import path = require("path");
import { checkEncoding } from "./utils/validation";
import { Logger } from "./utils/logger";
import {
  createArtistToDB,
  getPaintingDTO,
  getPaintingFromDB,
  IPainting,
  IResult,
  IResultCreatePatining,
  IUpdateInfo,
  updateWikiArtistPaintingToDB,
  WikiArtPainting,
  WikiArtPaintingDTO,
} from "./api/back-server/api";
import {
  appendDataToCSV,
  transformCSVFileToObjectList,
} from "./utils/csvUtils";
import { ITestResult, sendRequestWithTest } from "./task/task.backend.template";
import { send } from "process";
import { loadObjectFromJSON } from "./utils/jsonUtils";
import { transformTSVFileToObjectList } from "./utils/tsvUtils";
import { initFileWrite } from "./utils/file";
import { testGetPaintingAPI } from "./task/task.backend";

const sessionKey = `15de050dfe00`;
const dataFormat = "utf-8";

interface IGETMethodTest<T, R> {
  input: T;
  apiResult?: R;
}

async function main() {
  Logger.info("app start");

  //하나의 데이터 api 전송해서 실패 / 성공 반환 타입 확인하기

  // task
  const readFile = "./csvData/detailedMostViewed-3.json";
  const paintings = await loadObjectFromJSON<Painting[]>(readFile);

  testGetPaintingAPI(paintings);
}

main();
