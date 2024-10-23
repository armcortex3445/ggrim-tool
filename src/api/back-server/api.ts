import axios from "axios";
import { checkResponseHeader } from "../../utils/validation";
import { Logger } from "../../utils/logger";
import { Artist, Painting } from "../wikiArt/interfaces";
import { time } from "console";
import { title } from "process";
import { window } from "rxjs";
import { CustomError } from "../../utils/error";

const BACK_SERVER_URL = "http://localhost:3000";
const RouteMap = {
  painting: "painting",
};

export interface IResult<T> {
  data: T;
}

export interface WikiArtPainting {
  wikiArtId: string;
  title: string;
  url: string;
  artistName: string;
  artistUrl: string;

  //   @ManyToOne(() => wikiArtArtist, (artist) => artist.works)
  //   artist: wikiArtArtist;
  image: string;
  width: number;
  height: number;
  completitionYear: number | null; // painting completition year, default: null
  location: string; // location (country + city), default: ""
  //period: ArtistDictionaryJson | null; // artist’s period of work, default: null
  //serie: ArtistDictionaryJson | null; // artist’s paintings series, default: null
  genres: string[]; // array of genres names, default: [""]
  styles: string[]; // array of styles names, default: [""]
  media: string[]; // array of media names, default: [""]
  galleries: string[]; // array of galleries names, default: [""]
  tags: string[]; // array of tags names, default: [""]
  sizeX: number | null; // original painting dimension X, default: null
  sizeY: number | null; // original painting dimension Y, default: null
  diameter: number | null; // original painting diameter, default: null
  description: string; // painting description, default: ""
}

export interface IPainting {
  id: string;
  title: string;
  wikiArtPainting: WikiArtPainting;
}

export interface getPaintingDTO {
  wikiArtID: string;
  id?: string;
}

export async function getPaintingFromDB(
  dto: getPaintingDTO
): Promise<IResult<IPainting>> {
  const wikiArtID = dto.wikiArtID;
  const id = dto.id;
  try {
    const url = `${BACK_SERVER_URL}/${
      RouteMap.painting
    }?wikiArtID=${wikiArtID}&id=${id ? id : ""}`;

    const response = await axios.get<IResult<IPainting>>(url);
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
    throw new CustomError(
      createArtistToDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
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
    throw new CustomError(
      updateWikiArtistPaintingToDB.name,
      "REST_API",
      `status ${status}: ${error.message}`
    );
  }
}
