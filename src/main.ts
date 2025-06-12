import { Artist, Painting, PaintingShortJson } from "./api/wikiArt/interfaces";
import {
  runGetDetailedPainting,
  runGetDetailedPaintingWithTest,
  runGetPaintingsByArtist,
} from "./task/task.wikiArt";
import { IdentifierInterface } from "./utils/interface/interface";
import { loadListFromJSON } from "./utils/jsonUtils";
import {
  runInsertPaintingStepByStep,
  runInsertQuizToBackend,
  testGetPaintingAPI,
} from "./task/task.backend";

const dotenv = require("dotenv");
dotenv.config();

async function main() {}

main();
