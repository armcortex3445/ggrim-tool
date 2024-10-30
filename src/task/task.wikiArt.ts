import { getPaintingsByArtist } from "../api/wikiArt/api";
import { Painting, PaintingShortJson } from "../api/wikiArt/interfaces";
import { initFileWrite } from "../utils/file";
import { loadListFromJSON } from "../utils/jsonUtils";
import { Logger } from "../utils/logger";
import { createTaskObeservable } from "./task.api";

export async function runGetPaintingsByArtist() {
  Logger.info("app start");

  // task
  const readFile = "./sample.json";
  const paintings = await loadListFromJSON<Painting>(readFile);
  const sessionKey = `b1fae2b5bd0c`;

  const task = createTaskObeservable<PaintingShortJson[], Painting>(
    paintings,
    getArtistPaintings
  );

  task.subscribe((result) => {
    const artistName = result[0].artistName;

    const output = `./${artistName}-paintings.json`;
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
      paintingShortJsonList.push(...result.data);
    }

    return paintingShortJsonList;
  }
}
