import axios from "axios";
import { checkResponseHeader } from "../../utils/validation";
import { Logger } from "../../utils/logger";
import { Artist, Painting } from "../wikiArt/interfaces";
import { time } from "console";
import { title } from "process";
import { window } from "rxjs";
import { CustomError } from "../../utils/error";
import { ExtendedBackendPainting } from "./type";
import { CreatePaintingDTO, SearchPaintingDTO } from "./dto";

const BACK_SERVER_URL = "http://localhost:3000";
const RouteMap = {
  painting: "painting",
};

export async function getPaintingFromDB(
  dto: SearchPaintingDTO
): Promise<ExtendedBackendPainting[]> {
  let tags = "[]";
  let styles = "[]";
  if (dto.tags) {
    tags = JSON.stringify(dto.tags);
  }
  if (dto.styles) {
    styles = JSON.stringify(dto.styles);
  }
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}?title=${dto.title}&artistName=${dto.artistName}&tags=${tags}&styles=${styles}`;

    const response = await axios.get<ExtendedBackendPainting[]>(url);
    checkResponseHeader(response);
    //Logger.info(`[getArtistFromBD] ${JSON.stringify(response, null, 2)}`);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    throw new CustomError(
      getPaintingFromDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
    );
  }
}

export async function createArtistToDB(dto: CreatePaintingDTO) {
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}/`;

    const response = await axios.post<CreatePaintingDTO>(url, dto);
    checkResponseHeader(response);
    Logger.debug(
      `[createArtistToDB] ${JSON.stringify(response.data, null, 2)}`
    );
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    throw new CustomError(
      createArtistToDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
    );
  }
}
