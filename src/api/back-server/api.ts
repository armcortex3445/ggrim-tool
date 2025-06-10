import axios from "axios";
import { checkResponseHeader } from "../../utils/validation";
import { Logger } from "../../utils/logger";
import { Artist, Painting } from "../wikiArt/interfaces";
import { time } from "console";
import { title } from "process";
import { window } from "rxjs";
import { CustomError } from "../../utils/error";
import {
  BackendArtist,
  BackendPagination,
  BackendPainting,
  BackendStyle,
  BackendTag,
  ExtendedBackendPainting,
  IPaginationResult,
  Quiz,
} from "./type";
import {
  CreateArtistDTO,
  CreatePaintingDTO,
  CreateQuizDTO,
  CreateStyleDTO,
  CreateTagDTO,
  ReplacePaintingDTO,
  SearchPaintingDTO,
  SearchQuizDTO,
} from "./dto";
import { RequestQueryBuilder } from "@dataui/crud-request";

const BACK_SERVER_URL = "http://localhost:3000";
const RouteMap = {
  painting: "painting",
  tag: "painting/tag",
  style: "painting/style",
  artist: "artist",
  quiz: "quiz",
};

export async function getPaintingFromDB(
  dto: SearchPaintingDTO,
  page: number = 0
): Promise<BackendPagination<BackendPainting>> {
  if (!dto.tags) {
    dto.tags = [];
  }
  if (!dto.styles) {
    dto.styles = [];
  }
  const { title, artistName, tags, styles } = dto;

  const titleParam = `title=${title ?? ""}`;
  const artistParam = `artistName=${artistName}`;
  const tagParam = tags.map((t) => `tags[]=${t}`).join("&");
  const styleParam = styles.map((s) => `styles[]=${s}`).join("&");

  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}?${titleParam}&${artistParam}&${tagParam}&${styleParam}&page=${page}`;

    const response = await axios.get<BackendPagination<BackendPainting>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(getPaintingFromDB.name, [dto], error);
  }
}

export async function isPaintingExist(
  title: string,
  artistName: string,
  imageUrl: string
) {
  const result: BackendPagination<BackendPainting> = await getPaintingFromDB({
    title,
    artistName,
  });

  const paintings: BackendPainting[] = result.data;

  if (paintings.length === 0) {
    return false;
  }

  return paintings.some((painting) => painting.image_url === imageUrl);
}

export async function createPaintingToDB(
  dto: CreatePaintingDTO
): Promise<BackendPainting> {
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}/`;

    const response = await axios.post<BackendPainting>(url, dto);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(createPaintingToDB.name, [dto], error);
  }
}

export async function replacePaintingToDB(
  dto: ReplacePaintingDTO
): Promise<BackendPainting> {
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}/`;

    const response = await axios.put<BackendPainting>(url, dto);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(replacePaintingToDB.name, [dto], error);
  }
}

export async function getOnePainting(id: string) {
  const url = `${BACK_SERVER_URL}/${RouteMap.painting}/${id}`;
  try {
    const response = await axios.get<ExtendedBackendPainting>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(getOnePainting.name, [id], error);
  }
}

export async function createArtistToDB(
  dto: CreateArtistDTO
): Promise<BackendArtist> {
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.artist}/`;

    const response = await axios.post<BackendArtist>(url, dto);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(createArtistToDB.name, [dto], error);
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
    handleApiError(getTagFromDB.name, [requestQueryBuilder.query()], error);
  }
}

export async function isTagExist(tagName: string): Promise<boolean> {
  const qb = RequestQueryBuilder.create().setFilter({
    field: "name",
    operator: "$eq",
    value: tagName,
  });

  const data: BackendPagination<BackendTag> = await getTagFromDB(qb);

  return data.data.length > 0;
}

export async function createTagToDB(dto: CreateTagDTO): Promise<BackendTag> {
  const url = `${BACK_SERVER_URL}/${RouteMap.tag}`;
  try {
    const response = await axios.post<BackendTag>(url, dto);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(createTagToDB.name, [dto], error);
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
    handleApiError(getStyleFromDB.name, [requestQueryBuilder.query()], error);
  }
}

export async function isStyleExist(styleName: string): Promise<boolean> {
  const qb = RequestQueryBuilder.create().setFilter({
    field: "name",
    operator: "$eq",
    value: styleName,
  });

  const data: BackendPagination<BackendStyle> = await getStyleFromDB(qb);

  return data.data.length > 0;
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
    handleApiError(createStyleToDB.name, [dto], error);
  }
}

export async function getArtistFromDB(
  requestQueryBuilder: RequestQueryBuilder
): Promise<BackendPagination<BackendArtist>> {
  const query = requestQueryBuilder.query();
  Logger.debug(query);
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.artist}?${query}`;

    const response = await axios.get<BackendPagination<BackendArtist>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(getArtistFromDB.name, [requestQueryBuilder.query()], error);
  }
}

export async function isArtistExist(artistName: string): Promise<boolean> {
  const qb = RequestQueryBuilder.create().setFilter({
    field: "name",
    operator: "$eq",
    value: artistName,
  });

  const data: BackendPagination<BackendArtist> = await getArtistFromDB(qb);

  return data.data.length > 0;
}

export async function createQuiz(dto: CreateQuizDTO): Promise<Quiz> {
  const url = `${BACK_SERVER_URL}/${RouteMap.quiz}`;

  try {
    const response = await axios.post<Quiz>(url, dto);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(createQuiz.name, [dto], error);
  }
}

export async function getQuiz(id: string): Promise<Quiz> {
  const url = `${BACK_SERVER_URL}/${RouteMap.quiz}/${id}`;

  try {
    const response = await axios.get<Quiz>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    handleApiError(createQuiz.name, [id], error);
  }
}

function handleApiError(apiName: string, parameters: any[], error: any): never {
  Logger.error(
    `[${apiName}] api fail\n` +
      `\tparameters : ${JSON.stringify(parameters, null, 2)}`
  );
  const status = error.response?.status || "response undefined";
  if (error.response && error.response.data) {
    Logger.error(`${JSON.stringify(error.response.data, null, 2)}`);
  }
  throw new CustomError(
    apiName,
    "REST_API",
    `status ${status}: ${error.message}`
  );
}
