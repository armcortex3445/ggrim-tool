import { appendFileSync } from "fs";
import { getPaintingDetails, getPaintingsByArtist } from "../api/wikiArt/api";
import { Painting, PaintingShortJson } from "../api/wikiArt/interfaces";
import { getFileName, initFileWrite } from "../utils/file";
import { loadListFromJSON } from "../utils/jsonUtils";
import { Logger } from "../utils/logger";
import { getTaskObeservable$ } from "./task.api";
import {
  getTaskForRestAPITest$,
  getTaskForValidateRestAPI$,
} from "./task.test.api";
import { CustomError } from "../utils/error";
import { IdentifierInterface } from "../utils/interface/interface";
import { wait } from "../utils/execution";

export async function runGetPaintingsByArtist() {
  Logger.info("app start");

  // task
  const readFile = "./sample.json";
  const paintings = await loadListFromJSON<Painting>(readFile);
  const sessionKey = `50a5ca88e351`;

  const task = getTaskObeservable$<Painting, PaintingShortJson[]>(
    paintings,
    getArtistPaintings
  );

  task.subscribe((result) => {
    const artistName = result[0].artistName;

    const output = `./csvData/artist/${artistName}-paintings.json`;
    initFileWrite(output, JSON.stringify(result), "utf-8");
  });

  async function getArtistPaintings(painting: Painting) {
    let paginationToken = "";
    let hasMore = true;

    let paintingShortJsonList: PaintingShortJson[] = [];

    while (hasMore) {
      const result = await getPaintingsByArtist(
        painting.artistId,
        sessionKey,
        paginationToken
      );
      if (result.hasMore && result.paginationToken) {
        paginationToken = result.paginationToken;
      }
      hasMore = result.hasMore;

      if (!result.data) {
        console.log(
          `${painting.artistName} has problem.\n` +
            `${JSON.stringify({
              paginationToken,
              artistId: painting.artistId,
            })}`
        );
      }
      paintingShortJsonList.push(...result.data);
    }

    const second = 2;

    wait(second);

    return paintingShortJsonList;
  }
}

export async function runGetDetailedPainting(
  readJSONFile: string,
  sessionKey: string,
  delayMs: number = 2000,
  breakPoint?: IdentifierInterface<PaintingShortJson>
) {
  Logger.info("runGetDetailedPainting start");

  // task

  const shortPaintings = await loadListFromJSON<PaintingShortJson>(
    readJSONFile,
    breakPoint
  );

  const outPutFileName = getFileName(readJSONFile);
  const outputPath = `./csvData/painting/${outPutFileName}.json`;

  const outputFile = initFileWrite(outputPath, "[" + "\n", "utf-8");

  const task$ = getTaskObeservable$<PaintingShortJson, Painting>(
    shortPaintings,
    getPaintings,
    delayMs
  );

  task$.subscribe((painting) => {
    appendFileSync(outputFile, JSON.stringify(painting) + ",", "utf-8");
  });

  async function getPaintings(shortPaintings: PaintingShortJson) {
    return getPaintingDetails(sessionKey, shortPaintings.id);
  }
}

export async function runGetDetailedPaintingWithTest(
  readFile: string,
  sessionKey: string,
  delayMs: number,
  breakPoint?: IdentifierInterface<PaintingShortJson>
) {
  Logger.info("runGetDetailedPaintingWithTest start");

  const shortPaintings = await loadListFromJSON<PaintingShortJson>(
    readFile,
    breakPoint
  );

  const outPutFileName = getFileName(readFile);

  const outputPath = `./csvData/painting/otherPaintingByArtist/${outPutFileName}.json`;

  const outputFile = initFileWrite(outputPath, "[" + "\n", "utf-8");
  const testResultFile = outputFile + ".tsv";

  const task$ = getTaskForRestAPITest$<PaintingShortJson, Painting>(
    shortPaintings,
    "id",
    getPaintings,
    delayMs
  );

  const taskWithTest$ = getTaskForValidateRestAPI$(
    task$,
    "id",
    checkPaintingMatch,
    testResultFile
  );

  taskWithTest$.subscribe((result) => {
    appendFileSync(outputFile, JSON.stringify(result.apiResult) + ",", "utf-8");
  });

  async function getPaintings(shortPaintings: PaintingShortJson) {
    try {
      return getPaintingDetails(sessionKey, shortPaintings.id);
    } catch (err) {
      Logger.error(
        `[getPaintings] need to check short Painting.\n` +
          `id : ${shortPaintings.id}\n` +
          `url : ${shortPaintings.url}`
      );
      return {} as Painting;
    }
  }

  function checkPaintingMatch(
    shortPainting: PaintingShortJson,
    painting: Painting
  ) {
    const keys: (keyof PaintingShortJson)[] = [
      "id",
      "artistId",
      "title",
      "image",
    ];
    let result = "";

    for (const key of keys) {
      if (!(key in painting)) {
        result += `${key} is not included boths.`;
        continue;
      }

      let val1 = shortPainting[key];
      let val2 = painting[key];

      if (typeof val1 === "string" && typeof val2 === "string") {
        val1 = val1.toLowerCase();
        val2 = val2.toLocaleString();
      }

      if (
        JSON.stringify(shortPainting[key]) !== JSON.stringify(painting[key])
      ) {
        result += `${key} is not equal.`;
      }
    }

    return result;
  }
}
