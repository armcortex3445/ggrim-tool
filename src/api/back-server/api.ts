import axios from "axios";
import { checkResponseHeader } from "../../utils/validation";
import { Logger } from "../../utils/logger";
import { Artist, Painting } from "../wikiArt/interfaces";
import { time } from "console";
import { title } from "process";
import { window } from "rxjs";
import { CustomError } from "../../utils/error";
import {
  BackendPagination,
  BackendStyle,
  BackendTag,
  ExtendedBackendPainting,
  IPaginationResult,
} from "./type";
import {
  CreatePaintingDTO,
  CreateStyleDTO,
  CreateTagDTO,
  SearchPaintingDTO,
} from "./dto";
import { RequestQueryBuilder } from "@dataui/crud-request";

const BACK_SERVER_URL = "http://localhost:3000";
const RouteMap = {
  painting: "painting",
  tag: "painting/tag",
  style: "painting/style",
  artist: "artist",
};

export async function getPaintingFromDB(
  dto: SearchPaintingDTO
): Promise<IPaginationResult<ExtendedBackendPainting>> {
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

    const response = await axios.get<
      IPaginationResult<ExtendedBackendPainting>
    >(url);
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

export async function isPaintingExist(
  title: string,
  artistName: string,
  imageUrl: string
) {
  const result: IPaginationResult<ExtendedBackendPainting> =
    await getPaintingFromDB({
      title,
      artistName,
    });

  const paintings: ExtendedBackendPainting[] = result.data;

  if (paintings.length === 0) {
    return false;
  }

  return paintings.some((painting) => painting.image_url === imageUrl);
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

export async function getTagFromDB(
  requestQueryBuilder: RequestQueryBuilder
): Promise<BackendPagination<BackendTag>> {
  const query = requestQueryBuilder.query();
  Logger.debug(query);
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.tag}?${query}`;

    const response = await axios.get<BackendPagination<BackendTag>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    throw new CustomError(
      getTagFromDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
    );
  }
}

export async function isTagExist(tagName: string): Promise<boolean> {
  const qb = RequestQueryBuilder.create().setFilter({
    field: "name",
    operator: "$eq",
    value: tagName,
  });

  const data: BackendPagination<BackendTag> = await getTagFromDB(qb);

  if (data.data.length === 1) {
    return true;
  }

  return false;
}

export async function createTagToDB(dto: CreateTagDTO): Promise<BackendTag> {
  const url = `${BACK_SERVER_URL}/${RouteMap.tag}`;
  try {
    const response = await axios.post<BackendTag>(url, dto);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    throw new CustomError(
      createTagToDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
    );
  }
}

export async function getStyleFromDB(
  requestQueryBuilder: RequestQueryBuilder
): Promise<BackendPagination<BackendStyle>> {
  const query = requestQueryBuilder.query();
  Logger.debug(query);
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.style}?${query}`;

    const response = await axios.get<BackendPagination<BackendStyle>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    throw new CustomError(
      getStyleFromDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
    );
  }
}

export async function isStyleExist(styleName: string): Promise<boolean> {
  const qb = RequestQueryBuilder.create().setFilter({
    field: "name",
    operator: "$eq",
    value: styleName,
  });

  const data: BackendPagination<BackendStyle> = await getStyleFromDB(qb);

  if (data.data.length === 1) {
    return true;
  }

  return false;
}

export async function createStyleToDB(
  dto: CreateStyleDTO
): Promise<BackendStyle> {
  const url = `${BACK_SERVER_URL}/${RouteMap.style}`;
  try {
    const response = await axios.post<BackendStyle>(url, dto);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    throw new CustomError(
      createStyleToDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
    );
  }
}
