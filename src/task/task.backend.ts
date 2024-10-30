import {
  IPainting,
  IResult,
  WikiArtPainting,
  getPaintingDTO,
  getPaintingFromDB,
} from "../api/back-server/api";
import { Painting } from "../api/wikiArt/interfaces";
import { Logger } from "../utils/logger";
import {
  getTaskForRestAPITest$,
  getTaskForValidateRestAPI$,
} from "./task.test.api";

export function testGetPaintingAPI(paintings: Painting[]) {
  Logger.info("[testGetPaintingAPI] start");

  //하나의 데이터 api 전송해서 실패 / 성공 반환 타입 확인하기

  // task

  const identifier: keyof Painting = "id";
  const task$ = getTaskForRestAPITest$<Painting, IResult<IPainting>>(
    paintings,
    identifier,
    getPainting
  );

  const taskWithTest$ = getTaskForValidateRestAPI$<
    Painting,
    IResult<IPainting>
  >(task$, identifier, validatePainting);

  taskWithTest$.subscribe((result) =>
    Logger.debug(`${result.local[identifier]} is done`)
  );

  ///////////////////////////////////////////
  async function getPainting(painting: Painting) {
    const dto = transformDTO(painting);
    const result = await getPaintingFromDB(dto);

    return result;

    function transformDTO(painting: Painting) {
      const dto: getPaintingDTO = {
        wikiArtID: painting.id,
      };

      return dto;
    }
  }

  function validatePainting(local: Painting, serverResult: IResult<IPainting>) {
    let validateResult = "";

    const keys = Object.keys(local);
    let checkList = null;

    try {
      checkList = keys.reduce((list, key) => {
        if (Object.keys(serverResult.data.wikiArtPainting).includes(key)) {
          list.push(key);
        }
        return list;
      }, [] as string[]);
    } catch (e) {
      Logger.error(`${serverResult.data.id} has problem`);
      throw e;
    }

    Logger.debug(`[validatePainting] checkList : ${JSON.stringify(checkList)}`);

    checkList.forEach((key) => {
      const value1 = JSON.stringify(local[key as keyof Painting]);
      const value2 = JSON.stringify(
        serverResult.data.wikiArtPainting[key as keyof WikiArtPainting]
      );
      const isValid = value1 === value2 ? "O" : "X";

      if (isValid === "X") {
        Logger.debug(
          `[validatePainting] id ${local.id}\nvalue1 : ${value1}\nvalue2 : ${value2}`
        );
        validateResult += key + " : " + isValid;
        validateResult += ",";
      }
    });

    return validateResult;
  }
}
