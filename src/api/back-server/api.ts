import axios from "axios";
import { checkResponseHeader } from "../../utils/validation";
import { Logger } from "../../utils/logger";
import { Artist, Painting } from "../wikiArt/interfaces";
import { time } from "console";
import { title } from "process";
import { window } from "rxjs";

const BACK_SERVER_URL = "http://localhost:3000";
const RouteMap = {
  painting: "painting",
};

export interface IResult<T> {
  data: T[];
  pagination?: number;
  isMore?: boolean;
}

export interface IArtist {
  id: string;
  title: string;
}

export async function getArtistFromBD(title: string, id?: string) {
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}?title=${title}&id=${id}`;

    const response = await axios.get<IResult<IArtist>>(url);
    Logger.debug("Get Result");
    checkResponseHeader(response);
    //Logger.info(`[getArtistFromBD] ${JSON.stringify(response, null, 2)}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "No updated artists found", status: 404 };
    }
    throw new Error(`[getArtistFromBD]: ${error.message}`);
  }
}

export interface CreateArtistDTO {
  title: string;
}

export interface IResultCreatePatining {
  id: string;
}

export async function createArtistToDB(dto: CreateArtistDTO) {
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}/`;

    const response = await axios.post<IResultCreatePatining>(url, dto);
    checkResponseHeader(response);
    Logger.debug(
      `[createArtistToDB] ${JSON.stringify(response.data, null, 2)}`
    );
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    if (error.response && status === 404) {
      return { message: "No updated artists found", status: 404 };
    }
    throw new Error(
      `Failed to fetch createPainting. status ${status}: ${
        error.message
      } and response : ${JSON.stringify(error.response.message, null, 2)}`
    );
  }
}

export interface IUpdateWikiArtPainting {
  targetId: string;
  dto: WikiArtPaintingDTO;
}

export interface WikiArtPaintingDTO extends Partial<Painting> {
  wikiArtId: string;
}

export interface IUpdateInfo {
  targetId: string;
  isSuccess: boolean;
}

export async function updateWikiArtistPaintingToDB(
  updateInfo: IUpdateWikiArtPainting
) {
  const targetId = updateInfo.targetId;
  const dto = updateInfo.dto;
  try {
    const url = `${BACK_SERVER_URL}/${RouteMap.painting}/${targetId}/wiki-art`;
    Logger.debug(`[updateWikiArtistPaintingToDB] targetId : ${targetId}`);
    Logger.debug(
      `[updateWikiArtistPaintingToDB] dto : ${JSON.stringify(dto, null, 2)}`
    );

    const response = await axios.patch<IResult<IUpdateInfo>>(url, {
      ...dto,
    });
    checkResponseHeader(response);
    //Logger.info(`[createArtistToDB] ${JSON.stringify(response, null, 2)}`);
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || "response undefined";
    if (error.response && status === 404) {
      return { message: "No updated artists found", status: 404 };
    }
    throw new Error(
      `Failed to fetch updateWikiArtistPaintingToDB. status ${status}: ${error.message}`
    );
  }
}
