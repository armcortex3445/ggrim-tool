import {
  createArtistToDB,
  createPaintingToDB,
  createStyleToDB,
  createTagToDB,
  getOnePainting,
  getPaintingFromDB,
  isArtistExist,
  isPaintingExist,
  isStyleExist,
  isTagExist,
} from "../../api/back-server/api";
import {
  CreateArtistDTO,
  CreatePaintingDTO,
  CreateStyleDTO,
  CreateTagDTO,
  SearchPaintingDTO,
} from "../../api/back-server/dto";
import {
  BackendPagination,
  BackendPainting,
  ExtendedBackendPainting,
  IPaginationResult,
} from "../../api/back-server/type";
import { Painting } from "../../api/wikiArt/interfaces";
import { checkCompletion } from "../../utils/validation";

export async function getExtendedBackendPaintingByPainting(
  painting: Painting
): Promise<BackendPagination<ExtendedBackendPainting>> {
  const dto = createSearchDTO(painting);
  const result = await getPaintingFromDB(dto);

  const extendedPaintings = await Promise.all(
    result.data.map((short) => getOnePainting(short.id))
  );

  return {
    page: result.page,
    count: result.count,
    total: result.total,
    pageCount: result.pageCount,
    data: extendedPaintings,
  };
}

export function createSearchDTO(painting: Painting) {
  const dto: SearchPaintingDTO = {
    title: painting.title,
    artistName: painting.artistName,
    tags: painting.tags,
    styles: painting.styles,
  };

  return dto;
}

export async function findCorrectArtistNameOrFail(
  name: string
): Promise<string> {
  const targetNames: string[] = [];
  const parsed: string[] = name.trim().split(/\s+/);
  const del = " ";

  switch (parsed.length) {
    case 1:
      targetNames.push(parsed[0]);
      break;
    case 2:
      targetNames.push(parsed[1] + del + parsed[0]);
      break;
    case 3:
      // 이름이 단어 3개면, 경우의 수가 2개임
      targetNames.push(parsed[2] + del + parsed[0] + del + parsed[1]);
      targetNames.push(parsed[1] + del + parsed[2] + del + parsed[0]);
      break;
    default:
      throw new Error(
        `[findCorrectArtistName] not implemented case. ${JSON.stringify(
          parsed,
          null,
          2
        )}`
      );
  }

  const correctNames: string[] = [];

  for (const target of targetNames) {
    const isExist = await isArtistExist(target);
    if (isExist) {
      correctNames.push(target);
    }
  }

  if (correctNames.length === 0) {
    throw new Error(
      `[findCorrectArtistName] No Artist Found. ${JSON.stringify(targetNames)}`
    );
  }

  if (correctNames.length > 1) {
    throw new Error(
      `[findCorrectArtistName] Impossible case please check DB. ${JSON.stringify(
        correctNames
      )}`
    );
  }

  return correctNames[0];
}

export async function insertArtistWhenNotExisted(
  artistName: string
): Promise<string> {
  const isExist = await isArtistExist(artistName);
  let result = "";
  if (!isExist) {
    const dto: CreateArtistDTO = { name: artistName };
    await createArtistToDB(dto);

    const MAX_LOOP = 10;
    const WAIT_MS = 100;
    const loop: number = await checkCompletion(MAX_LOOP, WAIT_MS, () =>
      isArtistExist(artistName)
    );
    result += `create artist(${artistName}) {waiting ${loop}loop with ${WAIT_MS}ms}`;
  }
  return result;
}

export async function insertTagWhenNotExist(tag: string): Promise<string> {
  let result: string = "";
  const isExist = await isTagExist(tag);
  if (!isExist) {
    const dto: CreateTagDTO = { name: tag };
    await createTagToDB(dto);
    const MAX_LOOP = 10;
    const WAIT_MS = 100;
    const loop: number = await checkCompletion(MAX_LOOP, WAIT_MS, () =>
      isTagExist(tag)
    );
    result += `create Tag(${tag}). {waiting ${loop}loop with ${WAIT_MS}ms}`;
  }

  return result;
}

export async function insertStyleWhenNotExist(style: string): Promise<string> {
  let result: string = "";
  const isExist = await isStyleExist(style);
  if (!isExist) {
    const dto: CreateStyleDTO = { name: style };
    await createStyleToDB(dto);
    const MAX_LOOP = 10;
    const WAIT_MS = 100;
    const loop: number = await checkCompletion(MAX_LOOP, WAIT_MS, () =>
      isStyleExist(style)
    );
    result += `create style(${style}).{waiting loop(${loop} by ${WAIT_MS}ms}`;
  }
  return result;
}

export async function insertPaintingWhenNotExist(
  painting: Painting
): Promise<string> {
  let result = "";
  const isExist = await isPaintingExist(
    painting.title,
    painting.artistName,
    painting.image
  );
  if (!isExist) {
    const dto: CreatePaintingDTO = {
      title: painting.title,
      tags: painting.tags,
      image_url: painting.image,
      styles: painting.styles,
      description: painting.description,
      width: painting.width,
      height: painting.height,
      artistName: painting.artistName,
    };

    if (painting.completitionYear) {
      dto.completition_year = painting.completitionYear;
    }

    const backendPainting: BackendPainting = await createPaintingToDB(dto);

    result += `create Painting(${painting.title}). backendID : ${backendPainting.id}`;
  }
  return result;
}
