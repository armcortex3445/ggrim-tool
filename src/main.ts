import { Logger } from "winston";
import {
  createStyleToDB,
  createTagToDB,
  getStyleFromDB,
  isPaintingExist,
  isStyleExist,
  isTagExist,
} from "./api/back-server/api";
import { Painting, PaintingShortJson } from "./api/wikiArt/interfaces";
import {
  runGetDetailedPainting,
  runGetDetailedPaintingWithTest,
  runGetPaintingsByArtist,
} from "./task/task.wikiArt";
import { IdentifierInterface } from "./utils/interface/interface";
import { loadListFromJSON } from "./utils/jsonUtils";
import puppeteer, { executablePath } from "puppeteer-core";
import { connect } from "puppeteer-real-browser";
import { getPaintingDetails } from "./api/wikiArt/api";
import {
  runInsertPaintingStepByStep,
  runInsertQuizToBackend,
  testGetPaintingAPI,
} from "./task/task.backend";

const sessionKey: string = "3a68d7ac6a1d";
async function main() {
  await runQuizInsertToDB();
}

main();
async function runDetailPainting() {
  /*TODO
  - 여러개의 파일을 입력받아서, 여러번 task를 실행하도록 자동화하기.
  - 하나의 파일은 약 1시간 동안 400개 이하 api 발생시키도록 수정하기.
    - 작업 종료시, session key 갱신하기
  */
  const readFile: string = "./csvData/artist/4.selected_paintings_D.json"; //"./sample.json";
  const breakString: string = ` {
    "id": "5772780dedc2cb3880d6b9ed",
    "title": "Three sisters",
    "url": "three-sisters-1954",
    "artistUrl": "balthus",
    "artistName": "Balthus",
    "artistId": "57726d89edc2cb3880b497dd",
    "completitionYear": 1954,
    "width": 750,
    "image": "https://uploads6.wikiart.org/images/balthus/three-sisters-1954.jpg!Large.jpg",
    "height": 375
  }`;
  const breakObject: PaintingShortJson = JSON.parse(
    breakString
  ) as PaintingShortJson;
  const delayMs = 4000;
  const breakPoint: IdentifierInterface<PaintingShortJson> = {
    identifierKey: "id",
    identifier: breakObject.id,
  };
  await runGetDetailedPaintingWithTest(
    readFile,
    sessionKey,
    delayMs,
    undefined
  );
}

async function runPaintingByArtist() {
  const readFile: string = "./artist-painting2.json";

  await runGetPaintingsByArtist(readFile, sessionKey);
}

async function runValidationPaintingFromDB() {
  const readFile: string = "./sample.json";

  const paintings: Painting[] = loadListFromJSON<Painting>(readFile, undefined);

  await testGetPaintingAPI(paintings);
}

async function runPaintingInsertToDB() {
  const readFile: string = "./sample.json";
  //"./csvData/painting/otherPaintingByArtist/insertedToDB/4.selected_paintings_D.json.json";
  await runInsertPaintingStepByStep(readFile);
}

async function runPaintingInsertToDBMultiple() {
  const readFiles: string[] = [
    "1.selected_paintings.json.json",
    "2.selected_paintings.json.json",
    "3.selected_paintings.json.json",
    "4.selected_paintings_A.json.json",
    "4.selected_paintings_A2.json.json",
    "4.selected_paintings_B.json.json",
    "4.selected_paintings_C.json.json",
    "4.selected_paintings_C2.json.json",
    "4.selected_paintings_D.json.json",
  ];
  const location = "./csvData/painting/otherPaintingByArtist/";
  for (const readFile of readFiles) {
    /*TODO
    - 병렬 실행시, 디버깅이 어렵다
      - 특정 부분에서 오류가 발생했을 때, 어떤 파일을 실행하다가 오류가 발생했는지 파악이 어려움
      - 특히, 로그가 뒤죽박죽이라서 어느 부분이 문제가 되는지 확인하기 어렵다. */
    await runInsertPaintingStepByStep(location + readFile);
  }
}

async function runQuizInsertToDB() {
  const primitiveQuizFile: string = `./csvData/quiz/changed_painting_style/0.quiz.json`;
  await runInsertQuizToBackend(primitiveQuizFile);
}
