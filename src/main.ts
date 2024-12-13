import { Logger } from "winston";
import {
  createStyleToDB,
  createTagToDB,
  getStyleFromDB,
  isPaintingExist,
  isStyleExist,
  isTagExist,
} from "./api/back-server/api";
import { PaintingShortJson } from "./api/wikiArt/interfaces";
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

async function main() {
  runDetailPainting();
}

main();

async function runDetailPainting() {
  const readFile: string = "./sample.json"; //"./csvData/artist/0.selected_paintings_A.json";
  const breakString: string = `  {
    "id": "577272d5edc2cb3880c69a2f",
    "title": "Mercury after Pigalle",
    "url": "mercury-after-pigalle-1891",
    "artistUrl": "paul-cezanne",
    "artistName": "Paul Cezanne",
    "artistId": "57726d84edc2cb3880b48a5b",
    "completitionYear": 1891,
    "width": 454,
    "image": "https://uploads1.wikiart.org/images/paul-cezanne/mercury-after-pigalle-1891.jpg!Large.jpg",
    "height": 600
  }`;
  const breakObject: PaintingShortJson = JSON.parse(
    breakString
  ) as PaintingShortJson;
  const delayMs = 4000;
  const sessionKey = "2322464a2df1";
  const breakPoint: IdentifierInterface<PaintingShortJson> = {
    identifierKey: "id",
    identifier: breakObject.id,
  };
  runGetDetailedPaintingWithTest(readFile, sessionKey, delayMs, undefined);
}

async function runPaintingByArtist() {
  const readFile: string = "./artist-painting2.json";
  const sessionKey: string = "35d94f222422";
  runGetPaintingsByArtist(readFile, sessionKey);
}
